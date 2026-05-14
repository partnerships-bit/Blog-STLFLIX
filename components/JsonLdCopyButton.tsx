'use client';

import { useState } from 'react';

interface JsonLdCopyButtonProps {
  jsonLd: Record<string, unknown>;
}

export function JsonLdCopyButton({ jsonLd }: JsonLdCopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const hasData =
    jsonLd && typeof jsonLd === 'object' && Object.keys(jsonLd).length > 0;

  const handleCopy = async () => {
    if (!hasData) return;
    const scriptTag = `<script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n</script>`;
    try {
      await navigator.clipboard.writeText(scriptTag);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // clipboard pode falhar em contexto não-secure; silenciar
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={!hasData}
      title="Cola dentro de Custom Head do Hashnode"
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
        transition-colors disabled:opacity-40 disabled:cursor-not-allowed
        ${copied
          ? 'bg-green-500/20 text-green-300 border border-green-500/40'
          : 'bg-slate-700 hover:bg-slate-600 text-white border border-slate-600'}
      `}
    >
      {copied ? '✓ JSON-LD copiado' : 'Copiar JSON-LD'}
    </button>
  );
}
