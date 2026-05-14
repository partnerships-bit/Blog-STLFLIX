import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateArticle } from '@/lib/anthropic';
import { persistArticle } from '@/lib/articles';
import type { ArticleBundle } from '@/lib/types';

export const maxDuration = 300;

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

    const articleSourceUrl = source_url ?? transcription.source_url;

    const [generatedPt, generatedEn] = await Promise.all([
      generateArticle(transcription.content, 'pt-BR'),
      generateArticle(transcription.content, 'en'),
    ]);

    const [articlePt, articleEn] = await Promise.all([
      persistArticle({
        generated: generatedPt,
        transcriptionId: transcription_id,
        sourceUrl: articleSourceUrl,
        language: 'pt-BR',
      }),
      persistArticle({
        generated: generatedEn,
        transcriptionId: transcription_id,
        sourceUrl: articleSourceUrl,
        language: 'en',
      }),
    ]);

    const generationTime = (Date.now() - startTime) / 1000;

    await supabase.from('generation_logs').insert([
      {
        source_url: articleSourceUrl,
        video_duration_seconds: transcription.duration_seconds,
        generation_time_seconds: generationTime,
        word_count: generatedPt.wordCount,
        status: 'sucesso',
        article_id: articlePt.id,
      },
      {
        source_url: articleSourceUrl,
        video_duration_seconds: transcription.duration_seconds,
        generation_time_seconds: generationTime,
        word_count: generatedEn.wordCount,
        status: 'sucesso',
        article_id: articleEn.id,
      },
    ]);

    const bundle: ArticleBundle = { 'pt-BR': articlePt, en: articleEn };
    return NextResponse.json({ articles: bundle });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
