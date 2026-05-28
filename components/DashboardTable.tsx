'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
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

export function DashboardTable({ entries: initialEntries, weekCount }: DashboardTableProps) {
  const router = useRouter();
  const [entries, setEntries] = useState(initialEntries);
  const [confirmEntry, setConfirmEntry] = useState<{ logId: string; articleId: string | null } | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete(logId: string, articleId: string | null) {
    setDeleting(true);
    try {
      if (articleId) {
        const res = await fetch(`/api/articles/${articleId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Erro ao excluir');
        setEntries((prev) => prev.filter((e) => e.article_id !== articleId));
      } else {
        const res = await fetch(`/api/logs/${logId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Erro ao excluir');
        setEntries((prev) => prev.filter((e) => e.id !== logId));
      }
      router.refresh();
    } finally {
      setDeleting(false);
      setConfirmEntry(null);
    }
  }

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
                <th className="px-4 py-3 text-center">Idioma</th>
                <th className="px-4 py-3 text-right">Palavras</th>
                <th className="px-4 py-3 text-right">Tempo</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, i) => {
                const canOpen = entry.status === 'sucesso' && entry.article_id;
                return (
                  <tr
                    key={entry.id}
                    className={`
                      border-t border-slate-800 transition-colors
                      ${i % 2 === 0 ? 'bg-slate-900/50' : 'bg-slate-900'}
                      ${canOpen ? 'hover:bg-slate-800/80' : ''}
                    `}
                  >
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                      {formatDate(entry.created_at)}
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      {entry.title ? (
                        <div>
                          {canOpen ? (
                            <Link
                              href={`/articles/${entry.article_id}`}
                              className="text-white font-medium hover:text-orange-300 transition-colors truncate block"
                            >
                              {entry.title}
                            </Link>
                          ) : (
                            <p className="text-white font-medium truncate">{entry.title}</p>
                          )}
                          <p className="text-slate-500 text-xs truncate">{truncateUrl(entry.source_url)}</p>
                        </div>
                      ) : (
                        <p className="text-slate-500 truncate">{truncateUrl(entry.source_url)}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {entry.language ? (
                        <span
                          className={`
                            inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide
                            ${entry.language === 'en'
                              ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                              : 'bg-green-500/15 text-green-300 border border-green-500/30'}
                          `}
                        >
                          {entry.language === 'en' ? 'EN' : 'PT-BR'}
                        </span>
                      ) : (
                        <span className="text-slate-600 text-xs">—</span>
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
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex gap-2 justify-end">
                        {canOpen && (
                          <>
                            <Link
                              href={`/articles/${entry.article_id}`}
                              className="
                                inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium
                                bg-slate-700/60 text-slate-200 hover:bg-slate-700 transition-colors
                              "
                            >
                              Editar
                            </Link>
                            <Link
                              href={`/articles/${entry.article_id}/preview`}
                              className="
                                inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium
                                bg-orange-500/10 text-orange-300 hover:bg-orange-500/20 transition-colors
                              "
                            >
                              Ver HTML
                            </Link>
                          </>
                        )}
                        <button
                          onClick={() => setConfirmEntry({ logId: entry.id, articleId: entry.article_id })}
                          className="
                            inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium
                            bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors
                          "
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation modal */}
      {confirmEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-2xl max-w-sm w-full mx-4">
            <h2 className="text-white font-semibold text-base mb-2">Excluir registro</h2>
            <p className="text-slate-400 text-sm mb-6">
              Esta ação é irreversível.{' '}
              {confirmEntry.articleId
                ? 'O artigo e seu registro de geração serão excluídos permanentemente.'
                : 'O registro de erro será excluído permanentemente.'}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmEntry(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-700 text-slate-200 hover:bg-slate-600 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(confirmEntry.logId, confirmEntry.articleId)}
                disabled={deleting}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-500 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
