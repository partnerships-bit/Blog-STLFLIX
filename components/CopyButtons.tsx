'use client';

import { useState } from 'react';
import { marked } from 'marked';

interface CopyButtonsProps {
  title: string;
  metaDescription: string;
  bodyMd: string;
  keywords: string[];
}

export function CopyButtons({ title, metaDescription, bodyMd, keywords }: CopyButtonsProps) {
  const [copied, setCopied] = useState<'md' | 'html' | null>(null);

  async function copyToClipboard(text: string, type: 'md' | 'html') {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2500);
  }

  function buildMarkdown() {
    return [
      `# ${title}`,
      '',
      `> ${metaDescription}`,
      '',
      bodyMd,
      '',
      '---',
      `**Palavras-chave:** ${keywords.join(', ')}`,
    ].join('\n');
  }

  function buildHtml() {
    const bodyHtml = String(marked.parse(bodyMd));
    return [
      `<h1>${title}</h1>`,
      `<p><em>${metaDescription}</em></p>`,
      bodyHtml,
      `<p><strong>Palavras-chave:</strong> ${keywords.join(', ')}</p>`,
    ].join('\n');
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
