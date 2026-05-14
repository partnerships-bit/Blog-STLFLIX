export type Language = 'pt-BR' | 'en';

export interface Transcription {
  id: string;
  source_url: string;
  video_id: string;
  duration_seconds: number | null;
  content: string;
  language: string;
  created_at: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface HowToStep {
  name: string;
  text: string;
}

export interface Article {
  id: string;
  transcription_id: string;
  title: string;
  meta_description: string;
  body_md: string;
  body_html: string;
  keywords: string[];
  word_count: number;
  generated_at: string;

  // SEO/GEO (migration 0002)
  title_variants: string[];
  meta_variants: string[];
  slug: string | null;
  primary_keyword: string | null;
  tldr: string[];
  faq: FAQItem[];
  json_ld: Record<string, unknown>;
  is_tutorial: boolean;
  howto_steps: HowToStep[] | null;
  og_image_alt: string | null;
  reading_time_minutes: number | null;

  // Migration 0003
  language: Language;
}

export interface GenerationLog {
  id: string;
  source_url: string;
  video_duration_seconds: number | null;
  generation_time_seconds: number | null;
  word_count: number | null;
  status: 'sucesso' | 'erro';
  error_message: string | null;
  article_id: string | null;
  created_at: string;
}

export interface ArticleResult {
  id: string;
  transcription_id: string;
  title: string;
  metaDescription: string;
  bodyMd: string;
  bodyHtml: string;
  keywords: string[];
  wordCount: number;
  sourceUrl: string;

  // SEO/GEO
  titleVariants: string[];
  metaVariants: string[];
  slug: string;
  primaryKeyword: string;
  tldr: string[];
  faq: FAQItem[];
  isTutorial: boolean;
  howtoSteps: HowToStep[] | null;
  ogImageAlt: string;
  readingTimeMinutes: number;
  jsonLd: Record<string, unknown>;

  language: Language;
}

export interface DashboardEntry {
  id: string;
  article_id: string | null;
  source_url: string;
  title: string | null;
  word_count: number | null;
  generation_time_seconds: number | null;
  status: 'sucesso' | 'erro';
  created_at: string;
  language: Language | null;
}

export interface ArticleBundle {
  'pt-BR': ArticleResult | null;
  en: ArticleResult | null;
}

export type GenerateSSEEvent =
  | { stage: 'validating'; progress: number }
  | { stage: 'cache_hit'; progress: number }
  | { stage: 'transcribing'; progress: number }
  | { stage: 'generating'; progress: number }
  | { stage: 'done'; progress: 100; articles: ArticleBundle }
  | { stage: 'error'; message: string };
