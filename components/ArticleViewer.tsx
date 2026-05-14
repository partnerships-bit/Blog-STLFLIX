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
      <div>
        <Link
          href="/dashboard"
          className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
        >
          ← Voltar ao histórico
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
