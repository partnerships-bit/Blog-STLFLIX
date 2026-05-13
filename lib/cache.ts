import { supabase } from './supabase';
import type { Transcription } from './types';

export async function getCachedTranscription(
  videoId: string
): Promise<Transcription | null> {
  const { data, error } = await supabase
    .from('transcriptions')
    .select('*')
    .eq('video_id', videoId)
    .single();

  if (error || !data) return null;
  return data as Transcription;
}

export async function saveTranscription(params: {
  videoId: string;
  sourceUrl: string;
  content: string;
  durationSeconds: number | null;
  language?: string;
}): Promise<Transcription> {
  const { data, error } = await supabase
    .from('transcriptions')
    .insert({
      video_id: params.videoId,
      source_url: params.sourceUrl,
      content: params.content,
      duration_seconds: params.durationSeconds,
      language: params.language ?? 'pt',
    })
    .select()
    .single();

  if (error || !data) throw new Error(`Erro ao salvar transcrição: ${error?.message}`);
  return data as Transcription;
}
