import { AssemblyAI } from 'assemblyai';
import { spawn } from 'child_process';

const client = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY! });

const YT_DLP_BIN = process.env.YT_DLP_PATH || '/Users/karol/Library/Python/3.9/bin/yt-dlp';

async function downloadAudio(youtubeUrl: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const proc = spawn(YT_DLP_BIN, [
      '-f', 'bestaudio[ext=m4a]/bestaudio/best',
      '-o', '-',
      '--no-playlist',
      '--quiet',
      '--no-warnings',
      '--extractor-args', 'youtube:player_client=default,android_vr',
      youtubeUrl,
    ]);

    const chunks: Buffer[] = [];
    let stderr = '';

    proc.stdout.on('data', (chunk) => chunks.push(chunk));
    proc.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
    proc.on('error', reject);
    proc.on('close', (code) => {
      if (code === 0) {
        resolve(Buffer.concat(chunks));
      } else {
        reject(new Error(`yt-dlp falhou (code ${code}): ${stderr.trim()}`));
      }
    });
  });
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function classifyError(msg: string): string {
  const lower = msg.toLowerCase();
  if (
    lower.includes('private') ||
    lower.includes('unavailable') ||
    lower.includes('not found') ||
    lower.includes('403') ||
    lower.includes('could not download')
  ) {
    return 'Vídeo privado ou indisponível — tente com outra URL';
  }
  if (lower.includes('empty') || lower.includes('no audio')) {
    return 'Vídeo sem áudio detectado';
  }
  return `Falha na transcrição: ${msg}`;
}

export async function transcribeYouTube(
  youtubeUrl: string,
  onProgress: (progress: number) => void
): Promise<{ text: string; durationSeconds: number | null }> {
  onProgress(8);
  const audioBuffer = await downloadAudio(youtubeUrl);
  onProgress(15);
  const uploadUrl = await client.files.upload(audioBuffer);
  onProgress(20);

  const submitted = await client.transcripts.submit({
    audio_url: uploadUrl,
    language_code: 'pt',
    speech_models: ['universal-2'],
  } as any);

  let progress = 25;

  while (true) {
    const result = await client.transcripts.get(submitted.id);

    if (result.status === 'completed') {
      if (!result.text?.trim()) {
        throw new Error('Transcrição vazia — vídeo sem fala detectada');
      }
      return {
        text: result.text,
        durationSeconds: result.audio_duration ? Math.round(result.audio_duration) : null,
      };
    }

    if (result.status === 'error') {
      throw new Error(classifyError(result.error ?? 'erro desconhecido'));
    }

    progress = Math.min(progress + 4, 65);
    onProgress(progress);

    await sleep(5000);
  }
}
