'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArticlePreview } from './ArticlePreview';
import type { ArticleResult } from '@/lib/types';

interface ArticleViewerProps {
  initialArticle: ArticleResult;
}

export function ArticleViewer({ initialArticle }: ArticleViewerProps) {
  const [article, setArticle] = useState(initialArticle);
  const router = useRouter();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
        >
          ← Voltar ao histórico
        </Link>
        <Link
          href={`/articles/${article.id}/preview`}
          className="
            text-sm px-3 py-1.5 rounded-lg border border-orange-500/40
            text-orange-300 hover:bg-orange-500/10 transition-colors
          "
        >
          Visualizar HTML →
        </Link>
      </div>

      <ArticlePreview
        article={article}
        onRegenerated={setArticle}
        onNewUrl={() => router.push('/')}
      />
    </div>
  );
}
