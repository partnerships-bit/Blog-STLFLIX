import { supabase } from './supabase';

export const STORAGE_BUCKET = 'article-images';

// Gera chave única do tipo 2026/05/21/<provider>-<timestamp>-<rand>.<ext>.
// Pasta por dia ajuda na navegação no painel do Supabase.
export function makeStorageKey(provider: string, ext = 'png'): string {
  const date = new Date();
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 10);
  const ts = date.getTime();
  const safeExt = ext.replace(/[^a-z0-9]/gi, '').toLowerCase() || 'png';
  return `${yyyy}/${mm}/${dd}/${provider}-${ts}-${rand}.${safeExt}`;
}

interface UploadOptions {
  provider: string;
  contentType?: string;
  ext?: string;
}

export async function uploadToStorage(
  buffer: Buffer | Uint8Array,
  { provider, contentType = 'image/png', ext = 'png' }: UploadOptions,
): Promise<string> {
  const key = makeStorageKey(provider, ext);
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(key, buffer, {
      contentType,
      cacheControl: '31536000',
      upsert: false,
    });

  if (error) {
    throw new Error(`Falha ao subir imagem pro Supabase Storage: ${error.message}`);
  }

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(key);
  return data.publicUrl;
}

// Deriva extensão+contentType de um File (defaults: png/image/png).
export function fileExtAndType(file: File): { ext: string; contentType: string } {
  const type = (file.type || 'image/png').toLowerCase();
  if (type === 'image/jpeg' || type === 'image/jpg') return { ext: 'jpg', contentType: 'image/jpeg' };
  if (type === 'image/webp') return { ext: 'webp', contentType: 'image/webp' };
  if (type === 'image/gif') return { ext: 'gif', contentType: 'image/gif' };
  return { ext: 'png', contentType: 'image/png' };
}
