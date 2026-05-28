import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { extractFeaturedImage, extractImagePlan } from '@/lib/articles';
import type { ArticleResult, FAQItem, HowToStep, Language } from '@/lib/types';

const ARTICLE_COLUMNS = `
  id,
  transcription_id,
  title,
  meta_description,
  body_md,
  body_html,
  keywords,
  word_count,
  title_variants,
  meta_variants,
  slug,
  primary_keyword,
  tldr,
  faq,
  json_ld,
  is_tutorial,
  howto_steps,
  og_image_alt,
  reading_time_minutes,
  language,
  article_images,
  transcriptions (
    source_url
  )
`;

function rowToArticleResult(data: Record<string, any>): ArticleResult {
  const transcription = data.transcriptions as { source_url?: string } | null;
  const sourceUrl = transcription?.source_url ?? '';
  const language: Language = data.language === 'en' ? 'en' : 'pt-BR';
  const wordCount = (data.word_count as number) ?? 0;

  return {
    id: data.id,
    transcription_id: data.transcription_id,
    title: data.title,
    metaDescription: data.meta_description,
    bodyMd: data.body_md,
    bodyHtml: data.body_html,
    keywords: data.keywords ?? [],
    wordCount,
    sourceUrl,
    titleVariants: (data.title_variants as string[]) ?? [],
    metaVariants: (data.meta_variants as string[]) ?? [],
    slug: data.slug ?? '',
    primaryKeyword: data.primary_keyword ?? '',
    tldr: (data.tldr as string[]) ?? [],
    faq: (data.faq as FAQItem[]) ?? [],
    isTutorial: data.is_tutorial ?? false,
    howtoSteps: (data.howto_steps as HowToStep[] | null) ?? null,
    ogImageAlt: data.og_image_alt ?? '',
    readingTimeMinutes:
      data.reading_time_minutes ?? Math.max(1, Math.ceil(wordCount / 200)),
    jsonLd: (data.json_ld as Record<string, unknown>) ?? {},
    featuredImageUrl: extractFeaturedImage(data.json_ld),
    language,
    imagePlan: extractImagePlan(data.article_images),
  };
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select(ARTICLE_COLUMNS)
      .eq('id', params.id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) {
      return NextResponse.json({ error: 'Artigo não encontrado' }, { status: 404 });
    }

    return NextResponse.json(rowToArticleResult(data));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await supabase.from('generation_logs').delete().eq('article_id', params.id);

    const { error } = await supabase.from('articles').delete().eq('id', params.id);
    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { featuredImageUrl } = await req.json();

    // 1. Fetch current article's json_ld
    const { data: currentData, error: fetchError } = await supabase
      .from('articles')
      .select('json_ld')
      .eq('id', params.id)
      .maybeSingle();

    if (fetchError) throw new Error(fetchError.message);
    if (!currentData) {
      return NextResponse.json({ error: 'Artigo não encontrado' }, { status: 404 });
    }

    // 2. Update json_ld graph
    const jsonLdObj = (currentData.json_ld as Record<string, any>) || { '@context': 'https://schema.org', '@graph': [] };
    if (!Array.isArray(jsonLdObj['@graph'])) {
      jsonLdObj['@graph'] = [];
    }

    let articleGraph = jsonLdObj['@graph'].find((item: any) => item['@type'] === 'Article');
    if (!articleGraph) {
      articleGraph = { '@type': 'Article' };
      jsonLdObj['@graph'].push(articleGraph);
    }

    if (featuredImageUrl) {
      articleGraph.image = featuredImageUrl;
    } else {
      delete articleGraph.image;
    }

    // 3. Save back to Supabase
    const { data: updatedData, error: updateError } = await supabase
      .from('articles')
      .update({ json_ld: jsonLdObj })
      .eq('id', params.id)
      .select(ARTICLE_COLUMNS)
      .single();

    if (updateError || !updatedData) {
      throw new Error(updateError?.message || 'Erro ao atualizar artigo');
    }

    return NextResponse.json(rowToArticleResult(updatedData));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
