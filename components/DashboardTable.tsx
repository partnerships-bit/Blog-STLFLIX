'use client';

import type { DashboardEntry } from '@/lib/types';

interface DashboardTableProps {
  entries: DashboardEntry[];
  weekCount: number;
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

function truncateUrl(url: string) {
  try {
    const u = new URL(url);
    return u.hostname + u.pathname.slice(0, 30);
  } catch {
    return url.slice(0, 40);
  }
}

export function DashboardTable({ entries, weekCount }: DashboardTableProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Week counter */}
      <div className="flex gap-4">
        <div className="flex-1 bg-slate-800 rounded-xl p-5 border border-slate-700">
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Esta semana</p>
          <p className="text-4xl font-bold text-orange-400">{weekCount}</p>
          <p className="text-sm text-slate-400 mt-1">artigos gerados</p>
        </div>
        <div className="flex-1 bg-slate-800 rounded-xl p-5 border border-slate-700">
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Total histórico</p>
          <p className="text-4xl font-bold text-white">{entries.length}</p>
          <p className="text-sm text-slate-400 mt-1">últimas entradas</p>
        </div>
      </div>

      {/* Table */}
      {entries.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          Nenhum artigo gerado ainda.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-400 uppercase tracking-wide bg-slate-900">
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Título / URL</th>
                <th className="px-4 py-3 text-right">Palavras</th>
                <th className="px-4 py-3 text-right">Tempo</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, i) => (
                <tr
                  key={entry.id}
                  className={`border-t border-slate-800 ${i % 2 === 0 ? 'bg-slate-900/50' : 'bg-slate-900'}`}
                >
                  <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                    {formatDate(entry.created_at)}
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    {entry.title ? (
                      <div>
                        <p className="text-white font-medium truncate">{entry.title}</p>
                        <p className="text-slate-500 text-xs truncate">{truncateUrl(entry.source_url)}</p>
                      </div>
                    ) : (
                      <p className="text-slate-500 truncate">{truncateUrl(entry.source_url)}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-300">
                    {entry.word_count ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-300 whitespace-nowrap">
                    {entry.generation_time_seconds
                      ? `${Math.round(entry.generation_time_seconds)}s`
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`
                        inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${entry.status === 'sucesso'
                          ? 'bg-green-500/15 text-green-400'
                          : 'bg-red-500/15 text-red-400'}
                      `}
                    >
                      {entry.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
