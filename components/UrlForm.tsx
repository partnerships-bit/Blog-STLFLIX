'use client';

import { useState } from 'react';
import { isValidYouTubeUrl } from '@/lib/youtube';

interface UrlFormProps {
  onSubmit: (url: string) => void;
  disabled?: boolean;
  initialUrl?: string;
}

export function UrlForm({ onSubmit, disabled, initialUrl = '' }: UrlFormProps) {
  const [url, setUrl] = useState(initialUrl);
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = url.trim();

    if (!trimmed) {
      setError('Cole a URL do vídeo aqui');
      return;
    }

    if (!isValidYouTubeUrl(trimmed)) {
      setError('URL inválida — precisa ser um link do YouTube (youtube.com/watch?v= ou youtu.be/)');
      return;
    }

    setError('');
    onSubmit(trimmed);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex flex-col gap-3">
        <label htmlFor="youtube-url" className="text-sm font-medium text-slate-300">
          URL do vídeo no YouTube
        </label>
        <div className="flex gap-3">
          <input
            id="youtube-url"
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError('');
            }}
            placeholder="https://www.youtube.com/watch?v=..."
            disabled={disabled}
            className={`
              flex-1 px-4 py-3 rounded-lg bg-slate-800 border text-white placeholder-slate-500
              focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
              ${error ? 'border-red-500' : 'border-slate-700'}
            `}
          />
          <button
            type="submit"
            disabled={disabled}
            className="
              px-6 py-3 rounded-lg font-semibold bg-orange-500 hover:bg-orange-400
              text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed
              whitespace-nowrap
            "
          >
            Gerar artigo
          </button>
        </div>
        <p className="text-xs text-slate-500">
          Geramos automaticamente <strong className="text-slate-300">duas versões</strong> — uma em
          português (Brasil) e outra em inglês (global). Use as abas no artigo para alternar.
        </p>
        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}
      </div>
    </form>
  );
}
