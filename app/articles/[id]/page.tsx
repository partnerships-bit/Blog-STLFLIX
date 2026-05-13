import { notFound } from 'next/navigation';
import { ArticleViewer } from '@/components/ArticleViewer';
import type { ArticleResult } from '@/lib/types';

async function getArticle(id: string): Promise<ArticleResult | null> {
  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';

    const res = await fetch(`${baseUrl}/api/articles/${id}`, {
      cache: 'no-store',
    });

    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function ArticlePage({ params }: { params: { id: string } }) {
  const article = await getArticle(params.id);
  if (!article) notFound();

  return <ArticleViewer initialArticle={article} />;
}
