import { supabase } from './supabase';
import { buildJsonLd } from './jsonld';
import type { GeneratedArticle } from './anthropic';
import type {
  ArticleImagePlan,
  ArticleImagePlanItem,
  ArticleResult,
  ImagePriority,
  Language,
} from './types';

interface PersistArticleParams {
  generated: GeneratedArticle;
  transcriptionId: string;
  sourceUrl: string;
  language: Language;
}

// Helpers exportados — usados em todos os endpoints que constroem ArticleResult.
// Evita drift quando o shape muda.

export function extractFeaturedImage(jsonLd: unknown): string | null {
  if (!jsonLd || typeof jsonLd !== 'object') return null;
  const graph = (jsonLd as Record<string, unknown>)['@graph'];
  if (!Array.isArray(graph)) return null;
  const articleNode = graph.find(
    (n) => typeof n === 'object' && n !== null && (n as Record<string, unknown>)['@type'] === 'Article',
  ) as Record<string, unknown> | undefined;
  const img = articleNode?.image;
  return typeof img === 'string' && img ? img : null;
}

const VALID_PRIORITIES: ImagePriority[] = ['high', 'medium', 'low'];

export function extractImagePlan(raw: unknown): ArticleImagePlan | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  const rawImages = obj.images;
  if (!Array.isArray(rawImages) || rawImages.length === 0) return null;

  const images: ArticleImagePlanItem[] = rawImages
    .map((item) => {
      if (typeof item !== 'object' || item === null) return null;
      const o = item as Record<string, unknown>;
      const imageNumber = typeof o.image_number === 'number' ? o.image_number : NaN;
      if (!Number.isFinite(imageNumber)) return null;
      const priority: ImagePriority = VALID_PRIORITIES.includes(o.priority as ImagePriority)
        ? (o.priority as ImagePriority)
        : 'medium';
      return {
        image_number: imageNumber,
        placement: typeof o.placement === 'string' ? o.placement : '',
        section_reference: typeof o.section_reference === 'string' ? o.section_reference : '',
        purpose: typeof o.purpose === 'string' ? o.purpose : '',
        image_type: typeof o.image_type === 'string' ? o.image_type : 'detail shot',
        visual_description: typeof o.visual_description === 'string' ? o.visual_description : '',
        image_prompt: typeof o.image_prompt === 'string' ? o.image_prompt : '',
        alt_text: typeof o.alt_text === 'string' ? o.alt_text : '',
        seo_filename: typeof o.seo_filename === 'string' ? o.seo_filename : '',
        priority,
        generated_url: typeof o.generated_url === 'string' && o.generated_url ? o.generated_url : null,
        history: Array.isArray(o.history)
          ? (o.history as unknown[]).filter((u): u is string => typeof u === 'string' && u.length > 0)
          : [],
      };
    })
    .filter((x): x is ArticleImagePlanItem => x !== null);

  if (images.length === 0) return null;

  return {
    recommended_image_count:
      typeof obj.recommended_image_count === 'number' ? obj.recommended_image_count : images.length,
    strategy_notes: Array.isArray(obj.strategy_notes)
      ? (obj.strategy_notes as unknown[]).filter((s): s is string => typeof s === 'string' && s.length > 0)
      : [],
    images,
  };
}

export async function persistArticle({
  generated,
  transcriptionId,
  sourceUrl,
  language,
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
    language,
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
      language,
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
    featuredImageUrl: extractFeaturedImage(jsonLd),
    language,
    imagePlan: null, // recém-criado nunca tem plano
  };
}
