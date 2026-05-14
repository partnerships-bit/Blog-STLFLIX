-- Campos SEO/GEO adicionados à tabela articles
-- Estrutura semântica (TL;DR, FAQ, HowTo, JSON-LD) que ajuda Google a
-- rankear e LLMs (ChatGPT, Claude, Perplexity) a citar a STLFLIX como fonte.

ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS tldr jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS faq jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS json_ld jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS title_variants jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS meta_variants jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS reading_time_minutes integer,
  ADD COLUMN IF NOT EXISTS og_image_alt text,
  ADD COLUMN IF NOT EXISTS primary_keyword text,
  ADD COLUMN IF NOT EXISTS is_tutorial boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS howto_steps jsonb;

-- Lookup futuro de artigos por slug (URL pública no Hashnode)
CREATE INDEX IF NOT EXISTS idx_articles_slug
  ON articles(slug)
  WHERE slug IS NOT NULL;
