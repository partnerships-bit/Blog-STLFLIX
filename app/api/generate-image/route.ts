import { NextResponse } from 'next/server';
import { uploadToStorage } from '@/lib/storage';

export const maxDuration = 180;

// gpt-image-2 SEMPRE retorna b64_json (não URL). Em vez de devolver data URL
// gigante (~1-2 MB inflando JSON-LD/banco), subimos o binário pro Supabase Storage
// e devolvemos só a URL pública estável.
// Quality médio leva ~50s e gera imagem boa o suficiente pra capa de blog.
// 'high' chega a 80-120s — só vale a pena pra entregas finais (alterável aqui).
const OPENAI_IMAGE_MODEL = 'gpt-image-2';
const OPENAI_IMAGE_QUALITY: 'low' | 'medium' | 'high' | 'auto' = 'medium';

const MAX_REF_BYTES = 10 * 1024 * 1024;
const ALLOWED_REF = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/webp']);

interface OpenAiImageResponse {
  data?: Array<{ b64_json?: string; url?: string }>;
  error?: { message?: string };
}

async function generateWithOpenAi(prompt: string, apiKey: string): Promise<Buffer> {
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_IMAGE_MODEL,
      prompt,
      n: 1,
      size: '1024x1024',
      quality: OPENAI_IMAGE_QUALITY,
    }),
  });

  const data = (await response.json()) as OpenAiImageResponse;
  if (!response.ok) {
    throw new Error(data.error?.message || 'Erro na API da OpenAI');
  }
  const first = data.data?.[0];
  if (!first) throw new Error('Nenhuma imagem retornada pela OpenAI');

  if (first.b64_json) return Buffer.from(first.b64_json, 'base64');
  if (first.url) {
    const r = await fetch(first.url);
    if (!r.ok) throw new Error(`Falha ao baixar imagem da OpenAI (${r.status})`);
    return Buffer.from(await r.arrayBuffer());
  }
  throw new Error('Resposta da OpenAI sem b64_json nem url');
}

// /v1/images/edits aceita 1+ imagens de referência (campo image[]) + prompt, devolve PNG editado.
// Multipart obrigatório aqui — JSON não funciona pra esse endpoint.
// Cap em 4 imagens por chamada — passa disso o tempo da OpenAI vai além do nosso maxDuration.
async function generateFromReference(prompt: string, refFiles: File[], apiKey: string): Promise<Buffer> {
  const form = new FormData();
  form.append('model', OPENAI_IMAGE_MODEL);
  form.append('prompt', prompt);
  form.append('n', '1');
  form.append('size', '1024x1024');
  form.append('quality', OPENAI_IMAGE_QUALITY);
  for (const f of refFiles) {
    form.append('image[]', f, f.name || 'reference.png');
  }

  const response = await fetch('https://api.openai.com/v1/images/edits', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });

  const data = (await response.json()) as OpenAiImageResponse;
  if (!response.ok) {
    throw new Error(data.error?.message || 'Erro na API da OpenAI (edits)');
  }
  const first = data.data?.[0];
  if (!first) throw new Error('Nenhuma imagem retornada pela OpenAI (edits)');

  if (first.b64_json) return Buffer.from(first.b64_json, 'base64');
  if (first.url) {
    const r = await fetch(first.url);
    if (!r.ok) throw new Error(`Falha ao baixar imagem da OpenAI (${r.status})`);
    return Buffer.from(await r.arrayBuffer());
  }
  throw new Error('Resposta da OpenAI (edits) sem b64_json nem url');
}

async function generateWithPollinations(prompt: string): Promise<Buffer> {
  const encodedPrompt = encodeURIComponent(prompt);
  const seed = Math.floor(Math.random() * 1000000);
  const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&private=true&model=flux&seed=${seed}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Pollinations retornou ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    const apiKey = process.env.OPENAI_API_KEY;

    // ---- Modo "com referência": multipart/form-data + arquivo + prompt ----
    if (contentType.startsWith('multipart/form-data')) {
      if (!apiKey) {
        return NextResponse.json(
          { error: 'OPENAI_API_KEY ausente — geração com referência requer OpenAI (Pollinations não suporta).' },
          { status: 400 },
        );
      }
      const form = await request.formData();
      const prompt = String(form.get('prompt') || '').trim();
      // Aceita 1+ imagens em "referenceImages" (preferido) ou 1 em "referenceImage" (legado).
      const rawRefs = [
        ...form.getAll('referenceImages'),
        ...form.getAll('referenceImage'),
      ].filter((v): v is File => v instanceof File && v.size > 0);

      if (!prompt) {
        return NextResponse.json({ error: 'Prompt é obrigatório' }, { status: 400 });
      }
      if (rawRefs.length === 0) {
        return NextResponse.json({ error: 'Pelo menos uma imagem de referência é obrigatória' }, { status: 400 });
      }
      if (rawRefs.length > 4) {
        return NextResponse.json({ error: 'Máximo de 4 imagens de referência por geração' }, { status: 400 });
      }
      for (const f of rawRefs) {
        if (f.size > MAX_REF_BYTES) {
          return NextResponse.json({ error: `Imagem "${f.name}" maior que 10MB` }, { status: 400 });
        }
        const t = (f.type || 'image/png').toLowerCase();
        if (!ALLOWED_REF.has(t)) {
          return NextResponse.json({ error: `Tipo "${t}" não suportado em "${f.name}"` }, { status: 400 });
        }
      }

      console.log(
        `Generating image with ${rawRefs.length} reference(s) (${OPENAI_IMAGE_MODEL}) for prompt: "${prompt}"`,
      );
      const buffer = await generateFromReference(prompt, rawRefs, apiKey);
      const publicUrl = await uploadToStorage(buffer, { provider: 'openai-ref' });
      return NextResponse.json({
        url: publicUrl,
        provider: 'openai-ref',
        model: OPENAI_IMAGE_MODEL,
        referenceCount: rawRefs.length,
      });
    }

    // ---- Modo padrão: JSON, prompt-only ----
    const { prompt } = await request.json();
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt é obrigatório' }, { status: 400 });
    }

    if (apiKey) {
      console.log(`Generating image with OpenAI ${OPENAI_IMAGE_MODEL} for prompt: "${prompt}"`);
      const buffer = await generateWithOpenAi(prompt, apiKey);
      const publicUrl = await uploadToStorage(buffer, { provider: 'openai' });
      return NextResponse.json({ url: publicUrl, provider: 'openai', model: OPENAI_IMAGE_MODEL });
    }

    console.log(`OpenAI API Key not found. Falling back to Pollinations.ai (Flux) for prompt: "${prompt}"`);
    const buffer = await generateWithPollinations(prompt);
    const publicUrl = await uploadToStorage(buffer, { provider: 'pollinations' });
    return NextResponse.json({
      url: publicUrl,
      provider: 'pollinations',
      warning: 'Chave OPENAI_API_KEY não encontrada no arquivo .env. Usando fallback gratuito (Flux/Pollinations.ai).',
    });
  } catch (error) {
    console.error('Image generation error:', error);
    const message = error instanceof Error ? error.message : 'Erro desconhecido ao gerar imagem';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
