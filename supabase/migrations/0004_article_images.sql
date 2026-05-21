-- Plano de imagens + URLs geradas por artigo.
-- O conteúdo segue o schema ArticleImagePlanItem (lib/types.ts):
-- [{image_number, placement, section_reference, purpose, image_type,
--   visual_description, image_prompt, alt_text, seo_filename, priority,
--   generated_url}]
-- generated_url é null até a Karol clicar "Gerar essa imagem" no card.

ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS article_images jsonb NOT NULL DEFAULT '[]'::jsonb;

-- article_images guarda o objeto inteiro do plano (recommended_image_count,
-- strategy_notes, images). Por isso o index navega até o subarray .images.
CREATE INDEX IF NOT EXISTS idx_articles_has_images
  ON articles ((jsonb_array_length(COALESCE(article_images->'images', '[]'::jsonb)) > 0));
