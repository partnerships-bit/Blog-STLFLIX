-- Transcrições cacheadas por video_id
CREATE TABLE IF NOT EXISTS transcriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  source_url text NOT NULL,
  video_id text NOT NULL UNIQUE,
  duration_seconds integer,
  content text NOT NULL,
  language text DEFAULT 'pt',
  created_at timestamptz DEFAULT now()
);

-- Artigos gerados (N por transcrição)
CREATE TABLE IF NOT EXISTS articles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  transcription_id uuid REFERENCES transcriptions(id),
  title text NOT NULL,
  meta_description text NOT NULL,
  body_md text NOT NULL,
  body_html text NOT NULL,
  keywords text[] NOT NULL DEFAULT '{}',
  word_count integer NOT NULL DEFAULT 0,
  generated_at timestamptz DEFAULT now()
);

-- Log de cada execução do pipeline
CREATE TABLE IF NOT EXISTS generation_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  source_url text NOT NULL,
  video_duration_seconds integer,
  generation_time_seconds numeric,
  word_count integer,
  status text NOT NULL CHECK (status IN ('sucesso', 'erro')),
  error_message text,
  article_id uuid REFERENCES articles(id),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transcriptions_video_id ON transcriptions(video_id);
CREATE INDEX IF NOT EXISTS idx_generation_logs_created_at ON generation_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generation_logs_status ON generation_logs(status);
