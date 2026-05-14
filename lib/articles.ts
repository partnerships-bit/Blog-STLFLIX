import { supabase } from './supabase';
import { buildJsonLd } from './jsonld';
import type { GeneratedArticle } from './anthropic';
import type { ArticleResult } from './types';

interface PersistArticleParams {
  generated: GeneratedArticle;
  transcriptionId: string;
  sourceUrl: string;
}

export async function persistArticle({
  generated,
  transcriptionId,
  sourceUrl,
}: PersistArticleParams): Promise<ArticleResult> {
  const readingTimeMinutes = Math.max(1, Math.ceil(generated.wordCount / 200));

  const jsonLd = buildJsonLd({
    title: generated.title,
    metaDescription: generated.metaDescription,
    sourceUrl,
    slug: generated.slug || undefined,
    keywords: generated.keywords,
    wordCount: generated.wordCount,
    faq: generated.faq,
    isTutorial: generated.isTutorial,
    howtoSteps: generated.howtoSteps,
  });

  const { data, error } = await supabase
    .from('articles')
    .insert({
      transcription_id: transcriptionId,
      title: generated.title,
      meta_description: generated.metaDescription,
      body_md: generated.bodyMd,
      body_html: generated.bodyHtml,
      keywords: generated.keywords,
      word_count: generated.wordCount,
      title_variants: generated.titleVariants,
      meta_variants: generated.metaVariants,
      slug: generated.slug || null,
      primary_keyword: generated.primaryKeyword || null,
      tldr: generated.tldr,
      faq: generated.faq,
      json_ld: jsonLd,
      is_tutorial: generated.isTutorial,
      howto_steps: generated.howtoSteps,
      og_image_alt: generated.ogImageAlt || null,
      reading_time_minutes: readingTimeMinutes,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Erro ao salvar artigo: ${error?.message}`);
  }

  return {
    id: data.id,
    transcription_id: transcriptionId,
    title: generated.title,
    metaDescription: generated.metaDescription,
    bodyMd: generated.bodyMd,
    bodyHtml: generated.bodyHtml,
    keywords: generated.keywords,
    wordCount: generated.wordCount,
    sourceUrl,
    titleVariants: generated.titleVariants,
    metaVariants: generated.metaVariants,
    slug: generated.slug,
    primaryKeyword: generated.primaryKeyword,
    tldr: generated.tldr,
    faq: generated.faq,
    isTutorial: generated.isTutorial,
    howtoSteps: generated.howtoSteps,
    ogImageAlt: generated.ogImageAlt,
    readingTimeMinutes,
    jsonLd,
  };
}
