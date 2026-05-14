import { notFound } from 'next/navigation';
import { ArticleViewer } from '@/components/ArticleViewer';
import type { ArticleBundle, Language } from '@/lib/types';

interface BundleResponse {
  active: Language;
  articles: ArticleBundle;
}

async function getBundle(id: string): Promise<BundleResponse | null> {
  try {
    const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000';

    const res = await fetch(`${baseUrl}/api/articles/${id}/bundle`, {
      cache: 'no-store',
    });

    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function ArticlePage({ params }: { params: { id: string } }) {
  const data = await getBundle(params.id);
  if (!data) notFound();

  return <ArticleViewer initialBundle={data.articles} initialLanguage={data.active} />;
}
