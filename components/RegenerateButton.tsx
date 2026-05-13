'use client';

import { useState } from 'react';
import type { ArticleResult } from '@/lib/types';

interface RegenerateButtonProps {
  transcriptionId: string;
  sourceUrl: string;
  onRegenerated: (article: ArticleResult) => void;
}

export function RegenerateButton({
  transcriptionId,
  sourceUrl,
  onRegenerated,
}: RegenerateButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleRegenerate() {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcription_id: transcriptionId, source_url: sourceUrl }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error ?? 'Falha ao regenerar');
      }

      onRegenerated(data.article);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao regenerar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={handleRegenerate}
        disabled={loading}
        className="
          flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
          border border-slate-600 hover:border-orange-500 text-slate-300
          hover:text-orange-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
        "
      >
        {loading ? (
          <>
            <span className="animate-spin">↻</span> Regenerando...
          </>
        ) : (
          <>
            <span>↻</span> Regenerar artigo
          </>
        )}
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
