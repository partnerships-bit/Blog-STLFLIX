import { NextResponse } from 'next/server';
import { uploadToStorage, fileExtAndType } from '@/lib/storage';

export const maxDuration = 30;

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']);

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get('file');
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'Campo "file" é obrigatório (multipart/form-data)' }, { status: 400 });
    }
    if (file.size === 0) {
      return NextResponse.json({ error: 'Arquivo vazio' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: `Arquivo maior que 10MB (${(file.size / 1024 / 1024).toFixed(1)}MB)` }, { status: 400 });
    }
    const type = (file.type || 'image/png').toLowerCase();
    if (!ALLOWED.has(type)) {
      return NextResponse.json({ error: `Tipo não suportado: ${type}. Use PNG, JPG, WEBP ou GIF.` }, { status: 400 });
    }

    const { ext, contentType } = fileExtAndType(file);
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadToStorage(buffer, { provider: 'upload', contentType, ext });

    return NextResponse.json({ url, provider: 'upload' });
  } catch (error) {
    console.error('Upload error:', error);
    const message = error instanceof Error ? error.message : 'Erro desconhecido ao subir imagem';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
