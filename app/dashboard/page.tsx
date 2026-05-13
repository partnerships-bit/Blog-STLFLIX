import { DashboardTable } from '@/components/DashboardTable';
import type { DashboardEntry } from '@/lib/types';
import Link from 'next/link';

async function getArticles(): Promise<{ entries: DashboardEntry[]; weekCount: number }> {
  try {
    const baseUrl =
      process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000';

    const res = await fetch(`${baseUrl}/api/articles`, {
      cache: 'no-store',
    });

    if (!res.ok) return { entries: [], weekCount: 0 };
    return res.json();
  } catch {
    return { entries: [], weekCount: 0 };
  }
}

export default async function DashboardPage() {
  const { entries, weekCount } = await getArticles();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Histórico</h1>
          <p className="text-slate-400 text-sm mt-1">Clique no título para reabrir e copiar o artigo</p>
        </div>
        <Link
          href="/"
          className="
            px-4 py-2 rounded-lg text-sm font-medium bg-orange-500 hover:bg-orange-400
            text-white transition-colors
          "
        >
          Gerar novo artigo
        </Link>
      </div>

      <DashboardTable entries={entries} weekCount={weekCount} />
    </div>
  );
}
