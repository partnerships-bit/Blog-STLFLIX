import { notFound } from 'next/navigation';
import Link from 'next/link';
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

export async function generateMetadata({ params }: { params: { id: string } }) {
  const article = await getArticle(params.id);
  if (!article) return { title: 'Artigo não encontrado' };
  return {
    title: article.title,
    description: article.metaDescription,
    keywords: article.keywords,
  };
}

export default async function ArticlePreviewPage({ params }: { params: { id: string } }) {
  const article = await getArticle(params.id);
  if (!article) notFound();

  return (
    <article className="flex flex-col gap-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between text-sm">
        <Link
          href={`/articles/${article.id}`}
          className="text-slate-400 hover:text-orange-300 transition-colors"
        >
          ← Voltar para o editor
        </Link>
        <Link
          href="/dashboard"
          className="text-slate-400 hover:text-orange-300 transition-colors"
        >
          Histórico →
        </Link>
      </div>

      <header className="flex flex-col gap-4 pb-6 border-b border-slate-800">
        <h1 className="text-4xl font-bold text-white leading-tight">
          {article.title}
        </h1>
        <p className="text-lg text-slate-300 leading-relaxed">
          {article.metaDescription}
        </p>
        <div className="flex gap-2 flex-wrap pt-2">
          {article.keywords.map((kw) => (
            <span
              key={kw}
              className="px-2.5 py-1 rounded-full bg-slate-800 text-xs text-orange-300"
            >
              {kw}
            </span>
          ))}
        </div>
      </header>

      <div
        className="
          prose prose-invert prose-orange max-w-none
          prose-headings:text-white prose-h2:mt-10 prose-h2:mb-4
          prose-p:text-slate-200 prose-p:leading-relaxed
          prose-strong:text-white prose-a:text-orange-400 hover:prose-a:text-orange-300
          prose-li:text-slate-200 prose-code:text-orange-300
        "
        dangerouslySetInnerHTML={{ __html: article.bodyHtml }}
      />

      <footer className="pt-6 border-t border-slate-800 text-xs text-slate-500">
        <p>
          {article.wordCount} palavras · gerado pelo STLFLIX Blog Generator
        </p>
      </footer>
    </article>
  );
}
