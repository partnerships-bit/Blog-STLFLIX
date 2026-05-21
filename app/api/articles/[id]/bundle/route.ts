import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { extractFeaturedImage, extractImagePlan } from '@/lib/articles';
import type { ArticleBundle, ArticleResult, FAQItem, HowToStep, Language } from '@/lib/types';

const ARTICLE_COLUMNS = `
  id,
  transcription_id,
  title,
  meta_description,
  body_md,
  body_html,
  keywords,
  word_count,
  generated_at,
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

function rowToArticle(row: Record<string, unknown>): ArticleResult {
  const transcription = row.transcriptions as { source_url?: string } | null;
  const sourceUrl = transcription?.source_url ?? '';
  const language: Language = row.language === 'en' ? 'en' : 'pt-BR';
  const wordCount = (row.word_count as number) ?? 0;

  return {
    id: row.id as string,
    transcription_id: row.transcription_id as string,
    title: (row.title as string) ?? '',
    metaDescription: (row.meta_description as string) ?? '',
    bodyMd: (row.body_md as string) ?? '',
    bodyHtml: (row.body_html as string) ?? '',
    keywords: ((row.keywords as string[]) ?? []),
    wordCount,
    sourceUrl,
    titleVariants: ((row.title_variants as string[]) ?? []),
    metaVariants: ((row.meta_variants as string[]) ?? []),
    slug: (row.slug as string) ?? '',
    primaryKeyword: (row.primary_keyword as string) ?? '',
    tldr: ((row.tldr as string[]) ?? []),
    faq: ((row.faq as FAQItem[]) ?? []),
    isTutorial: (row.is_tutorial as boolean) ?? false,
    howtoSteps: (row.howto_steps as HowToStep[] | null) ?? null,
    ogImageAlt: (row.og_image_alt as string) ?? '',
    readingTimeMinutes:
      (row.reading_time_minutes as number) ?? Math.max(1, Math.ceil(wordCount / 200)),
    jsonLd: (row.json_ld as Record<string, unknown>) ?? {},
    featuredImageUrl: extractFeaturedImage(row.json_ld),
    language,
    imagePlan: extractImagePlan(row.article_images),
  };
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Achar o artigo pedido (descobre transcription_id + language ativo)
    const { data: requested, error: rError } = await supabase
      .from('articles')
      .select(ARTICLE_COLUMNS)
      .eq('id', params.id)
      .maybeSingle();

    if (rError) throw new Error(rError.message);
    if (!requested) {
      return NextResponse.json({ error: 'Artigo não encontrado' }, { status: 404 });
    }

    const transcriptionId = requested.transcription_id as string;
    const requestedLang: Language = requested.language === 'en' ? 'en' : 'pt-BR';
    const otherLang: Language = requestedLang === 'en' ? 'pt-BR' : 'en';

    // 2. Achar o par (artigo mais recente do outro idioma p/ mesma transcrição)
    const { data: otherRows, error: oError } = await supabase
      .from('articles')
      .select(ARTICLE_COLUMNS)
      .eq('transcription_id', transcriptionId)
      .eq('language', otherLang)
      .order('generated_at', { ascending: false })
      .limit(1);

    if (oError) throw new Error(oError.message);

    const requestedArticle = rowToArticle(requested);
    const otherArticle = otherRows?.[0] ? rowToArticle(otherRows[0]) : null;

    const bundle: ArticleBundle = {
      'pt-BR': requestedLang === 'pt-BR' ? requestedArticle : otherArticle,
      en: requestedLang === 'en' ? requestedArticle : otherArticle,
    };

    return NextResponse.json({ active: requestedLang, articles: bundle });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
