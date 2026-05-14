-- Idioma do artigo (pt-BR ou en). Default pt-BR cobre os 6 artigos existentes.
-- Permite gerar o mesmo vídeo em PT e EN lado a lado e usar como
-- inLanguage no JSON-LD por artigo.

ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'pt-BR';

ALTER TABLE articles
  ADD CONSTRAINT articles_language_check
  CHECK (language IN ('pt-BR', 'en'));

CREATE INDEX IF NOT EXISTS idx_articles_language ON articles(language);
