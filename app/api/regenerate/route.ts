import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateArticle } from '@/lib/anthropic';
import type { ArticleResult } from '@/lib/types';

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { transcription_id, source_url } = await request.json();

    if (!transcription_id) {
      return NextResponse.json({ error: 'transcription_id obrigatório' }, { status: 400 });
    }

    const { data: transcription, error: tError } = await supabase
      .from('transcriptions')
      .select('*')
      .eq('id', transcription_id)
      .single();

    if (tError || !transcription) {
      return NextResponse.json({ error: 'Transcrição não encontrada' }, { status: 404 });
    }

    const generated = await generateArticle(transcription.content);

    const { data: articleData, error: articleError } = await supabase
      .from('articles')
      .insert({
        transcription_id,
        title: generated.title,
        meta_description: generated.metaDescription,
        body_md: generated.bodyMd,
        body_html: generated.bodyHtml,
        keywords: generated.keywords,
        word_count: generated.wordCount,
      })
      .select()
      .single();

    if (articleError || !articleData) {
      throw new Error(`Erro ao salvar artigo: ${articleError?.message}`);
    }

    const generationTime = (Date.now() - startTime) / 1000;

    await supabase.from('generation_logs').insert({
      source_url: source_url ?? transcription.source_url,
      video_duration_seconds: transcription.duration_seconds,
      generation_time_seconds: generationTime,
      word_count: generated.wordCount,
      status: 'sucesso',
      article_id: articleData.id,
    });

    const article: ArticleResult = {
      id: articleData.id,
      transcription_id,
      title: generated.title,
      metaDescription: generated.metaDescription,
      bodyMd: generated.bodyMd,
      bodyHtml: generated.bodyHtml,
      keywords: generated.keywords,
      wordCount: generated.wordCount,
      sourceUrl: source_url ?? transcription.source_url,
    };

    return NextResponse.json({ article });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
