'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArticlePreview } from './ArticlePreview';
import type { ArticleBundle, Language } from '@/lib/types';

interface ArticleViewerProps {
  initialBundle: ArticleBundle;
  initialLanguage: Language;
}

export function ArticleViewer({ initialBundle, initialLanguage }: ArticleViewerProps) {
  const [bundle, setBundle] = useState<ArticleBundle>(initialBundle);
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
        articles={bundle}
        initialLanguage={initialLanguage}
        onRegenerated={setBundle}
        onNewUrl={() => router.push('/')}
      />
    </div>
  );
}
