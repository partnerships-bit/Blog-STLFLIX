'use client';

import { useState } from 'react';
import { marked } from 'marked';
import type { FAQItem } from '@/lib/types';

interface CopyButtonsProps {
  title: string;
  metaDescription: string;
  bodyMd: string;
  keywords: string[];
  tldr: string[];
  faq: FAQItem[];
  featuredImageUrl?: string | null;
}

export function CopyButtons({
  title,
  metaDescription,
  bodyMd,
  keywords,
  tldr,
  faq,
  featuredImageUrl,
}: CopyButtonsProps) {
  const [copied, setCopied] = useState<'md' | 'html' | null>(null);

  async function copyToClipboard(text: string, type: 'md' | 'html') {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2500);
  }

  function buildMarkdown(): string {
    const parts: string[] = [`# ${title}`, ''];

    if (featuredImageUrl) {
      parts.push(`![${title}](${featuredImageUrl})`, '');
    }

    parts.push(`> ${metaDescription}`);

    if (tldr.length > 0) {
      parts.push('', '## TL;DR', '');
      for (const bullet of tldr) {
        parts.push(`- ${bullet}`);
      }
    }

    parts.push('', bodyMd);

    const cleanFaq = faq.filter((f) => f.question.trim() && f.answer.trim());
    if (cleanFaq.length > 0) {
      parts.push('', '## FAQ', '');
      for (const item of cleanFaq) {
        parts.push(`### ${item.question.trim()}`, '', item.answer.trim(), '');
      }
    }

    parts.push('---', `**Palavras-chave:** ${keywords.join(', ')}`);
    return parts.join('\n');
  }

  function buildHtml(): string {
    const out: string[] = [
      `<h1>${escapeHtml(title)}</h1>`,
    ];

    if (featuredImageUrl) {
      out.push(`<img src="${escapeHtml(featuredImageUrl)}" alt="${escapeHtml(title)}" style="max-width:100%; height:auto;" />`, '');
    }

    out.push(`<p><em>${escapeHtml(metaDescription)}</em></p>`);

    if (tldr.length > 0) {
      out.push('<h2>TL;DR</h2>');
      out.push('<ul>');
      for (const bullet of tldr) {
        out.push(`  <li>${escapeHtml(bullet)}</li>`);
      }
      out.push('</ul>');
    }

    out.push(String(marked.parse(bodyMd)));

    const cleanFaq = faq.filter((f) => f.question.trim() && f.answer.trim());
    if (cleanFaq.length > 0) {
      out.push('<h2>FAQ</h2>');
      for (const item of cleanFaq) {
        out.push(`<h3>${escapeHtml(item.question.trim())}</h3>`);
        out.push(`<p>${escapeHtml(item.answer.trim())}</p>`);
      }
    }

    out.push(`<p><strong>Palavras-chave:</strong> ${escapeHtml(keywords.join(', '))}</p>`);
    return out.join('\n');
  }

  return (
    <div className="flex gap-3 flex-wrap">
      <button
        onClick={() => copyToClipboard(buildMarkdown(), 'md')}
        className="
          flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
          bg-slate-700 hover:bg-slate-600 text-white transition-colors
        "
      >
        {copied === 'md' ? (
          <>
            <span>✓</span> Copiado como Markdown
          </>
        ) : (
          <>
            <span>📋</span> Copiar como Markdown
          </>
        )}
      </button>

      <button
        onClick={() => copyToClipboard(buildHtml(), 'html')}
        className="
          flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
          bg-slate-700 hover:bg-slate-600 text-white transition-colors
        "
      >
        {copied === 'html' ? (
          <>
            <span>✓</span> Copiado como HTML
          </>
        ) : (
          <>
            <span>🌐</span> Copiar como HTML
          </>
        )}
      </button>
    </div>
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
