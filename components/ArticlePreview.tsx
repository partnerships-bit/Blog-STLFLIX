'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { ArticleBundle, ArticleResult, Language } from '@/lib/types';
import { ArticleEditor } from './ArticleEditor';
import { RegenerateButton } from './RegenerateButton';

interface ArticlePreviewProps {
  articles: ArticleBundle;
  initialLanguage?: Language;
  onRegenerated: (bundle: ArticleBundle) => void;
  onNewUrl: () => void;
}

const LANGUAGE_META: Record<Language, { code: string; label: string; sub: string }> = {
  'pt-BR': { code: 'PT-BR', label: 'Português', sub: 'Brasil' },
  en: { code: 'EN', label: 'English', sub: 'Global' },
};

export function ArticlePreview({
  articles,
  initialLanguage,
  onRegenerated,
  onNewUrl,
}: ArticlePreviewProps) {
  const firstAvailable: Language = articles['pt-BR'] ? 'pt-BR' : 'en';
  const [active, setActive] = useState<Language>(initialLanguage ?? firstAvailable);

  const activeArticle: ArticleResult | null = articles[active];

  const wordCount = useMemo(() => {
    return activeArticle?.bodyMd.split(/\s+/).filter(Boolean).length ?? 0;
  }, [activeArticle]);
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  // For regeneration we need a transcription_id and source_url. They are the
  // same across both languages (same video), so any available article works.
  const refArticle = articles['pt-BR'] ?? articles.en;

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Artigo gerado</h2>
          <p className="text-sm text-slate-400">
            {wordCount} palavras · ~{readingTimeMinutes}{' '}
            {readingTimeMinutes === 1 ? 'min de leitura' : 'mins de leitura'} ·
            edite qualquer campo antes de exportar
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          {activeArticle && (
            <Link
              href={`/articles/${activeArticle.id}/preview`}
              target="_blank"
              rel="noopener noreferrer"
              title="Abre numa nova aba — mostra a versão salva (suas edições locais não vão pro preview até regerar)"
              className="
                inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium
                border border-orange-500/40 text-orange-300 hover:bg-orange-500/10
                transition-colors
              "
            >
              Ver HTML ↗
            </Link>
          )}
          {refArticle && (
            <RegenerateButton
              transcriptionId={refArticle.transcription_id}
              sourceUrl={refArticle.sourceUrl}
              onRegenerated={onRegenerated}
            />
          )}
          <button
            onClick={onNewUrl}
            className="
              px-4 py-2 rounded-lg text-sm font-medium border border-slate-600
              hover:border-slate-400 text-slate-300 transition-colors
            "
          >
            Nova URL
          </button>
        </div>
      </div>

      {/* Language tabs — large */}
      <div
        role="tablist"
        aria-label="Idioma do artigo"
        className="flex border-b border-slate-800"
      >
        {(['pt-BR', 'en'] as Language[]).map((lang) => {
          const isActive = lang === active;
          const meta = LANGUAGE_META[lang];
          const available = articles[lang] !== null;
          return (
            <button
              key={lang}
              type="button"
              role="tab"
              aria-selected={isActive}
              disabled={!available}
              onClick={() => available && setActive(lang)}
              className={`
                relative px-5 py-3 flex items-center gap-2 -mb-px transition-colors
                disabled:opacity-40 disabled:cursor-not-allowed
                ${isActive
                  ? 'text-white border-b-2 border-orange-500'
                  : 'text-slate-400 border-b-2 border-transparent hover:text-slate-200'}
              `}
            >
              <span
                className={`
                  inline-flex items-center justify-center min-w-[2.5rem] px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide
                  ${isActive
                    ? lang === 'en'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      : 'bg-green-500/20 text-green-300 border border-green-500/40'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'}
                `}
              >
                {meta.code}
              </span>
              <span className="flex flex-col items-start leading-tight">
                <span className="text-sm font-semibold">{meta.label}</span>
                <span className="text-[11px] text-slate-500">{meta.sub}</span>
              </span>
              {!available && (
                <span className="text-[10px] uppercase text-slate-600 ml-1">indisponível</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Editors — both mounted to preserve in-tab edits, only active is visible */}
      {(['pt-BR', 'en'] as Language[]).map((lang) => {
        const art = articles[lang];
        if (!art) return null;
        return <ArticleEditor key={art.id} article={art} hidden={lang !== active} />;
      })}
    </div>
  );
}
