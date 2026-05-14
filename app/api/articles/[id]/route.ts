import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { ArticleResult, FAQItem, HowToStep } from '@/lib/types';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select(`
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
        transcriptions (
          source_url
        )
      `)
      .eq('id', params.id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) {
      return NextResponse.json({ error: 'Artigo não encontrado' }, { status: 404 });
    }

    const transcription = data.transcriptions as { source_url?: string } | null;
    const sourceUrl = transcription?.source_url ?? '';

    const article: ArticleResult = {
      id: data.id,
      transcription_id: data.transcription_id,
      title: data.title,
      metaDescription: data.meta_description,
      bodyMd: data.body_md,
      bodyHtml: data.body_html,
      keywords: data.keywords ?? [],
      wordCount: data.word_count ?? 0,
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
        data.reading_time_minutes ?? Math.max(1, Math.ceil((data.word_count ?? 0) / 200)),
      jsonLd: (data.json_ld as Record<string, unknown>) ?? {},
    };

    return NextResponse.json(article);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
