export interface Transcription {
  id: string;
  source_url: string;
  video_id: string;
  duration_seconds: number | null;
  content: string;
  language: string;
  created_at: string;
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
}

export interface DashboardEntry {
  id: string;
  source_url: string;
  title: string | null;
  word_count: number | null;
  generation_time_seconds: number | null;
  status: 'sucesso' | 'erro';
  created_at: string;
}

export type GenerateSSEEvent =
  | { stage: 'validating'; progress: number }
  | { stage: 'cache_hit'; progress: number }
  | { stage: 'transcribing'; progress: number }
  | { stage: 'generating'; progress: number }
  | { stage: 'done'; progress: 100; article: ArticleResult }
  | { stage: 'error'; message: string };
