import { NextRequest } from 'next/server';
import { extractVideoId, isValidYouTubeUrl, toCanonicalUrl } from '@/lib/youtube';
import { getCachedTranscription, saveTranscription } from '@/lib/cache';
import { transcribeYouTube } from '@/lib/assemblyai';
import { generateArticle } from '@/lib/anthropic';
import { persistArticle } from '@/lib/articles';
import { supabase } from '@/lib/supabase';
import type { GenerateSSEEvent } from '@/lib/types';

export const maxDuration = 300;

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: GenerateSSEEvent) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
        );
      };

      const startTime = Date.now();
      let sourceUrl = '';

      try {
        const body = await request.json();
        sourceUrl = String(body.url ?? '').trim();

        send({ stage: 'validating', progress: 5 });

        if (!isValidYouTubeUrl(sourceUrl)) {
          send({ stage: 'error', message: 'URL inválida — cole um link do YouTube (youtube.com/watch?v= ou youtu.be/)' });
          controller.close();
          return;
        }

        const videoId = extractVideoId(sourceUrl)!;
        const canonicalUrl = toCanonicalUrl(videoId);

        let transcription = await getCachedTranscription(videoId);
        let durationSeconds: number | null = null;

        if (transcription) {
          send({ stage: 'cache_hit', progress: 70 });
          durationSeconds = transcription.duration_seconds;
        } else {
          send({ stage: 'transcribing', progress: 10 });

          const result = await transcribeYouTube(canonicalUrl, (progress) => {
            send({ stage: 'transcribing', progress });
          });

          durationSeconds = result.durationSeconds;
          transcription = await saveTranscription({
            videoId,
            sourceUrl: canonicalUrl,
            content: result.text,
            durationSeconds: result.durationSeconds,
          });
        }

        send({ stage: 'generating', progress: 70 });

        const generated = await generateArticle(transcription.content);

        const article = await persistArticle({
          generated,
          transcriptionId: transcription.id,
          sourceUrl: canonicalUrl,
        });

        const generationTime = (Date.now() - startTime) / 1000;

        await supabase.from('generation_logs').insert({
          source_url: sourceUrl,
          video_duration_seconds: durationSeconds,
          generation_time_seconds: generationTime,
          word_count: generated.wordCount,
          status: 'sucesso',
          article_id: article.id,
        });

        send({ stage: 'done', progress: 100, article });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro desconhecido';

        await supabase.from('generation_logs').insert({
          source_url: sourceUrl,
          generation_time_seconds: (Date.now() - startTime) / 1000,
          status: 'erro',
          error_message: message,
        }).then(() => {});

        send({ stage: 'error', message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
