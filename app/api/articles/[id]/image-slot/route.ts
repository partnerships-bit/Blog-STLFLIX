import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { extractImagePlan } from '@/lib/articles';

export const maxDuration = 30;

// PATCH /api/articles/[id]/image-slot
// Body: { image_number: number, generated_url: string | null }
// Atualiza generated_url do slot correspondente do plano e devolve o plano.
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { image_number, generated_url } = await request.json();
    if (typeof image_number !== 'number') {
      return NextResponse.json({ error: 'image_number deve ser numérico' }, { status: 400 });
    }

    const { data: current, error: fetchError } = await supabase
      .from('articles')
      .select('article_images')
      .eq('id', params.id)
      .maybeSingle();

    if (fetchError) throw new Error(fetchError.message);
    if (!current) {
      return NextResponse.json({ error: 'Artigo não encontrado' }, { status: 404 });
    }

    const plan = extractImagePlan(current.article_images);
    if (!plan) {
      return NextResponse.json(
        { error: 'Artigo ainda não tem plano de imagens. Gere o plano antes.' },
        { status: 409 },
      );
    }

    const idx = plan.images.findIndex((img) => img.image_number === image_number);
    if (idx === -1) {
      return NextResponse.json(
        { error: `image_number ${image_number} não encontrado no plano` },
        { status: 404 },
      );
    }

    const slot = plan.images[idx];
    const previousUrl = slot.generated_url;
    const newUrl = typeof generated_url === 'string' && generated_url ? generated_url : null;

    // Histórico: empurra a URL anterior pro topo quando muda (regerar ou restaurar).
    // Dedupa pra não repetir a mesma versão duas vezes, cap em 5.
    let history = slot.history || [];
    if (previousUrl && previousUrl !== newUrl) {
      history = [previousUrl, ...history.filter((u: string) => u !== previousUrl && u !== newUrl)];
    } else if (newUrl) {
      // No-op de URL: garante que a nova URL nunca apareça também no histórico.
      history = history.filter((u: string) => u !== newUrl);
    }
    history = history.slice(0, 5);

    plan.images[idx] = {
      ...slot,
      generated_url: newUrl,
      history,
    };

    const { error: updateError } = await supabase
      .from('articles')
      .update({ article_images: plan })
      .eq('id', params.id);

    if (updateError) {
      throw new Error(`Erro ao atualizar slot: ${updateError.message}`);
    }

    return NextResponse.json({ imagePlan: plan });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
