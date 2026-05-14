'use client';

import type { FAQItem } from '@/lib/types';

interface SeoScorePanelProps {
  title: string;
  meta: string;
  bodyMd: string;
  primaryKeyword: string;
  tldr: string[];
  faq: FAQItem[];
  wordCount: number;
  readingTimeMinutes: number;
}

interface Check {
  label: string;
  pass: boolean;
  detail: string;
}

function countH2(md: string): number {
  return (md.match(/^##\s+.+$/gm) || []).length;
}

function countKeywordOccurrences(md: string, keyword: string): number {
  if (!keyword.trim()) return 0;
  const escaped = keyword.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return (md.match(new RegExp(`\\b${escaped}\\b`, 'gi')) || []).length;
}

function buildChecks(p: SeoScorePanelProps): Check[] {
  const h2s = countH2(p.bodyMd);
  const titleLen = p.title.length;
  const metaLen = p.meta.length;
  const kwOcc = countKeywordOccurrences(p.bodyMd, p.primaryKeyword);
  const kwDensity = p.wordCount > 0 ? (kwOcc / p.wordCount) * 100 : 0;

  return [
    {
      label: 'Título ≤60 chars',
      pass: titleLen > 0 && titleLen <= 60,
      detail: `${titleLen}/60`,
    },
    {
      label: 'Meta 120–160 chars',
      pass: metaLen >= 120 && metaLen <= 160,
      detail: `${metaLen} chars`,
    },
    {
      label: '≥3 H2s no corpo',
      pass: h2s >= 3,
      detail: `${h2s} H2 ${h2s === 1 ? 'encontrado' : 'encontrados'}`,
    },
    {
      label: 'TL;DR ≥3 bullets',
      pass: p.tldr.length >= 3,
      detail: `${p.tldr.length} ${p.tldr.length === 1 ? 'bullet' : 'bullets'}`,
    },
    {
      label: 'FAQ ≥4 perguntas',
      pass: p.faq.length >= 4,
      detail: `${p.faq.length} ${p.faq.length === 1 ? 'pergunta' : 'perguntas'}`,
    },
    {
      label: 'Corpo ≥800 palavras',
      pass: p.wordCount >= 800,
      detail: `${p.wordCount} palavras`,
    },
    {
      label: 'Densidade keyword 1–2%',
      pass: kwDensity >= 1 && kwDensity <= 2,
      detail: p.primaryKeyword
        ? `${kwDensity.toFixed(2)}% (${kwOcc}x “${p.primaryKeyword}”)`
        : 'sem primary keyword',
    },
  ];
}

export function SeoScorePanel(props: SeoScorePanelProps) {
  const checks = buildChecks(props);
  const passedCount = checks.filter((c) => c.pass).length;
  const totalCount = checks.length;

  const scoreColor =
    passedCount === totalCount
      ? 'text-green-400'
      : passedCount >= totalCount - 2
        ? 'text-yellow-400'
        : 'text-red-400';

  return (
    <aside className="sticky top-6 bg-slate-800 rounded-xl p-5 border border-slate-700">
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wide">
          SEO Score
        </h3>
        <span className={`text-2xl font-bold ${scoreColor}`}>
          {passedCount}/{totalCount}
        </span>
      </div>

      <ul className="space-y-2.5 text-sm">
        {checks.map((c) => (
          <li key={c.label} className="flex items-start gap-2">
            <span
              aria-hidden
              className={`text-base leading-none mt-0.5 ${c.pass ? 'text-green-400' : 'text-red-400'}`}
            >
              {c.pass ? '✓' : '✗'}
            </span>
            <div className="flex-1 min-w-0">
              <p className={c.pass ? 'text-slate-200' : 'text-slate-300'}>{c.label}</p>
              <p className="text-slate-500 text-xs">{c.detail}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-5 pt-4 border-t border-slate-700 flex justify-between text-sm">
        <span className="text-slate-400">Tempo de leitura</span>
        <span className="text-slate-100 font-medium">
          ~{props.readingTimeMinutes} {props.readingTimeMinutes === 1 ? 'min' : 'mins'}
        </span>
      </div>
    </aside>
  );
}
