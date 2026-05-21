import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateImagePlan } from '@/lib/imageplan';
import type { ArticleImagePlan, Language } from '@/lib/types';

export const maxDuration = 120;

// POST /api/image-plan
// Body: { article_id: string }
// Gera plano via Claude, salva em articles.article_images, devolve { imagePlan }.
export async function POST(request: NextRequest) {
  try {
    const { article_id } = await request.json();
    if (!article_id) {
      return NextResponse.json({ error: 'article_id obrigatório' }, { status: 400 });
    }

    const { data: article, error: fetchError } = await supabase
      .from('articles')
      .select('id, title, body_md, primary_keyword, keywords, language, word_count, is_tutorial')
      .eq('id', article_id)
      .maybeSingle();

    if (fetchError) throw new Error(fetchError.message);
    if (!article) {
      return NextResponse.json({ error: 'Artigo não encontrado' }, { status: 404 });
    }

    const language: Language = article.language === 'en' ? 'en' : 'pt-BR';

    const plan: ArticleImagePlan = await generateImagePlan({
      title: article.title,
      bodyMd: article.body_md,
      primaryKeyword: article.primary_keyword ?? '',
      keywords: (article.keywords as string[]) ?? [],
      language,
      wordCount: article.word_count ?? 0,
      isTutorial: article.is_tutorial ?? false,
    });

    const { error: updateError } = await supabase
      .from('articles')
      .update({ article_images: plan })
      .eq('id', article_id);

    if (updateError) {
      throw new Error(`Erro ao salvar plano: ${updateError.message}`);
    }

    return NextResponse.json({ imagePlan: plan });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
