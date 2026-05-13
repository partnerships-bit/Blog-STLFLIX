import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { ArticleResult } from '@/lib/types';

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

    const article: ArticleResult = {
      id: data.id,
      transcription_id: data.transcription_id,
      title: data.title,
      metaDescription: data.meta_description,
      bodyMd: data.body_md,
      bodyHtml: data.body_html,
      keywords: data.keywords ?? [],
      wordCount: data.word_count ?? 0,
      sourceUrl: transcription?.source_url ?? '',
    };

    return NextResponse.json(article);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
