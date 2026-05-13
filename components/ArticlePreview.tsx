'use client';

import { useState, useEffect } from 'react';
import type { ArticleResult } from '@/lib/types';
import { CopyButtons } from './CopyButtons';
import { RegenerateButton } from './RegenerateButton';

interface ArticlePreviewProps {
  article: ArticleResult;
  onRegenerated: (article: ArticleResult) => void;
  onNewUrl: () => void;
}

export function ArticlePreview({ article, onRegenerated, onNewUrl }: ArticlePreviewProps) {
  const [title, setTitle] = useState(article.title);
  const [metaDescription, setMetaDescription] = useState(article.metaDescription);
  const [bodyMd, setBodyMd] = useState(article.bodyMd);
  const [keywords, setKeywords] = useState(article.keywords.join(', '));

  useEffect(() => {
    setTitle(article.title);
    setMetaDescription(article.metaDescription);
    setBodyMd(article.bodyMd);
    setKeywords(article.keywords.join(', '));
  }, [article]);

  const keywordsArray = keywords
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);

  const wordCount = bodyMd.split(/\s+/).filter(Boolean).length;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Artigo gerado</h2>
          <p className="text-sm text-slate-400">
            {wordCount} palavras · edite qualquer campo antes de exportar
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <RegenerateButton
            transcriptionId={article.transcription_id}
            sourceUrl={article.sourceUrl}
            onRegenerated={onRegenerated}
          />
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

      {/* Fields */}
      <div className="flex flex-col gap-5">
        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              Título SEO
            </label>
            <span className={`text-xs ${title.length > 60 ? 'text-red-400' : 'text-slate-500'}`}>
              {title.length}/60
            </span>
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="
              w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700
              text-white text-lg font-semibold focus:outline-none focus:ring-2
              focus:ring-orange-500 transition-colors
            "
          />
        </div>

        {/* Meta description */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              Meta-description
            </label>
            <span className={`text-xs ${metaDescription.length > 160 ? 'text-red-400' : 'text-slate-500'}`}>
              {metaDescription.length}/160
            </span>
          </div>
          <textarea
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            rows={2}
            className="
              w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700
              text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500
              transition-colors resize-none
            "
          />
        </div>

        {/* Body */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            Corpo do artigo (Markdown)
          </label>
          <textarea
            value={bodyMd}
            onChange={(e) => setBodyMd(e.target.value)}
            rows={24}
            className="
              w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700
              text-slate-200 font-mono text-sm focus:outline-none focus:ring-2
              focus:ring-orange-500 transition-colors resize-y leading-relaxed
            "
          />
        </div>

        {/* Keywords */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            Palavras-chave long-tail (separadas por vírgula)
          </label>
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            className="
              w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700
              text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500
              transition-colors
            "
          />
          <div className="flex gap-2 flex-wrap mt-1">
            {keywordsArray.map((kw) => (
              <span
                key={kw}
                className="px-2.5 py-1 rounded-full bg-slate-700 text-xs text-orange-300"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Export */}
      <div className="pt-2 border-t border-slate-800">
        <p className="text-xs text-slate-500 mb-3">Exportar artigo editado</p>
        <CopyButtons
          title={title}
          metaDescription={metaDescription}
          bodyMd={bodyMd}
          keywords={keywordsArray}
        />
      </div>
    </div>
  );
}
