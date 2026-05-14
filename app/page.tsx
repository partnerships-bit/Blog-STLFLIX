'use client';

import { useState, useCallback } from 'react';
import { UrlForm } from '@/components/UrlForm';
import { ProgressBar } from '@/components/ProgressBar';
import { ArticlePreview } from '@/components/ArticlePreview';
import { ErrorState } from '@/components/ErrorState';
import type { ArticleBundle, GenerateSSEEvent } from '@/lib/types';

type AppState =
  | { phase: 'idle' }
  | { phase: 'loading'; progress: number; stage: string }
  | { phase: 'success'; articles: ArticleBundle }
  | { phase: 'error'; message: string; lastUrl: string };

export default function HomePage() {
  const [state, setState] = useState<AppState>({ phase: 'idle' });
  const [lastUrl, setLastUrl] = useState('');

  const handleSubmit = useCallback(async (url: string) => {
    setLastUrl(url);
    setState({ phase: 'loading', progress: 0, stage: 'validating' });

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.body) throw new Error('Sem resposta do servidor');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;

          try {
            const event: GenerateSSEEvent = JSON.parse(line.slice(6));

            if (event.stage === 'error') {
              setState({ phase: 'error', message: event.message, lastUrl: url });
              return;
            }

            if (event.stage === 'done') {
              setState({ phase: 'success', articles: event.articles });
              return;
            }

            setState({
              phase: 'loading',
              progress: event.progress,
              stage: event.stage,
            });
          } catch {
            // skip malformed events
          }
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro de conexão';
      setState({ phase: 'error', message, lastUrl: url });
    }
  }, []);

  const handleRegenerated = useCallback((articles: ArticleBundle) => {
    setState({ phase: 'success', articles });
  }, []);

  const handleNewUrl = useCallback(() => {
    setState({ phase: 'idle' });
  }, []);

  const handleRetry = useCallback(() => {
    if (lastUrl) handleSubmit(lastUrl);
  }, [lastUrl, handleSubmit]);

  return (
    <div className="flex flex-col gap-10">
      {/* Hero */}
      {state.phase === 'idle' && (
        <div className="text-center mb-2">
          <h1 className="text-3xl font-bold text-white mb-3">
            Gere artigos SEO a partir dos seus vídeos
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto text-base">
            Cole a URL de um vídeo da STLFLIX no YouTube e receba um artigo
            otimizado para SEO em português e em inglês, pronto para revisar e publicar.
          </p>
        </div>
      )}

      {/* URL Form — always visible when idle or error */}
      {(state.phase === 'idle' || state.phase === 'error') && (
        <UrlForm
          onSubmit={handleSubmit}
          initialUrl={state.phase === 'error' ? state.lastUrl : ''}
        />
      )}

      {/* Loading */}
      {state.phase === 'loading' && (
        <div className="flex flex-col gap-8 items-center py-6">
          <ProgressBar progress={state.progress} stage={state.stage} />
        </div>
      )}

      {/* Error */}
      {state.phase === 'error' && (
        <ErrorState
          message={state.message}
          onRetry={handleRetry}
          onNewUrl={handleNewUrl}
        />
      )}

      {/* Success */}
      {state.phase === 'success' && (
        <ArticlePreview
          articles={state.articles}
          onRegenerated={handleRegenerated}
          onNewUrl={handleNewUrl}
        />
      )}
    </div>
  );
}
