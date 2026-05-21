import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const maxDuration = 180;

// gpt-image-2 SEMPRE retorna b64_json (não URL). Em vez de devolver data URL
// gigante (~1-2 MB inflando JSON-LD/banco), subimos o binário pro Supabase Storage
// e devolvemos só a URL pública estável.
// Quality médio leva ~50s e gera imagem boa o suficiente pra capa de blog.
// 'high' chega a 80-120s — só vale a pena pra entregas finais (alterável aqui).
const OPENAI_IMAGE_MODEL = 'gpt-image-2';
const OPENAI_IMAGE_QUALITY: 'low' | 'medium' | 'high' | 'auto' = 'medium';
const STORAGE_BUCKET = 'article-images';

function makeKey(provider: string): string {
  // Slug de pasta por dia + uuid curto pra evitar colisão sem precisar dependência extra
  const date = new Date();
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 10);
  const ts = date.getTime();
  return `${yyyy}/${mm}/${dd}/${provider}-${ts}-${rand}.png`;
}

async function uploadToStorage(buffer: Buffer, provider: string): Promise<string> {
  const key = makeKey(provider);
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(key, buffer, {
      contentType: 'image/png',
      cacheControl: '31536000', // 1 ano — imagens são imutáveis depois de geradas
      upsert: false,
    });

  if (error) {
    throw new Error(`Falha ao subir imagem pro Supabase Storage: ${error.message}`);
  }

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(key);
  return data.publicUrl;
}

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt é obrigatório' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey) {
      console.log(`Generating image with OpenAI ${OPENAI_IMAGE_MODEL} for prompt: "${prompt}"`);
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: OPENAI_IMAGE_MODEL,
          prompt,
          n: 1,
          size: '1024x1024',
          quality: OPENAI_IMAGE_QUALITY,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || 'Erro na API da OpenAI');
      }

      const first = data.data?.[0];
      if (!first) {
        throw new Error('Nenhuma imagem retornada pela OpenAI');
      }

      let buffer: Buffer | null = null;

      if (first.b64_json) {
        buffer = Buffer.from(first.b64_json, 'base64');
      } else if (first.url) {
        // Fallback defensivo: se algum dia a OpenAI mudar e mandar URL, baixamos pra subir igual
        const r = await fetch(first.url);
        if (!r.ok) throw new Error(`Falha ao baixar imagem da OpenAI (${r.status})`);
        buffer = Buffer.from(await r.arrayBuffer());
      }

      if (!buffer) {
        throw new Error('Resposta da OpenAI sem b64_json nem url');
      }

      const publicUrl = await uploadToStorage(buffer, 'openai');
      return NextResponse.json({ url: publicUrl, provider: 'openai', model: OPENAI_IMAGE_MODEL });
    } else {
      console.log(`OpenAI API Key not found. Falling back to Pollinations.ai (Flux) for prompt: "${prompt}"`);

      const encodedPrompt = encodeURIComponent(prompt);
      const seed = Math.floor(Math.random() * 1000000);
      const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&private=true&model=flux&seed=${seed}`;

      // Baixa do Pollinations (URL temporária do CDN deles) e estabiliza no Supabase Storage
      const r = await fetch(pollinationsUrl);
      if (!r.ok) {
        throw new Error(`Pollinations retornou ${r.status}`);
      }
      const buffer = Buffer.from(await r.arrayBuffer());
      const publicUrl = await uploadToStorage(buffer, 'pollinations');

      return NextResponse.json({
        url: publicUrl,
        provider: 'pollinations',
        warning: 'Chave OPENAI_API_KEY não encontrada no arquivo .env. Usando fallback gratuito (Flux/Pollinations.ai).'
      });
    }
  } catch (error) {
    console.error('Image generation error:', error);
    const message = error instanceof Error ? error.message : 'Erro desconhecido ao gerar imagem';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
