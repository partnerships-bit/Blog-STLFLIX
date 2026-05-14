'use client';

interface SerpPreviewProps {
  title: string;
  slug: string;
  meta: string;
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + '…';
}

export function SerpPreview({ title, slug, meta }: SerpPreviewProps) {
  const displayTitle = truncate(title.trim() || 'Título do artigo', 60);
  const displaySlug = (slug || 'slug-do-artigo').trim();
  const displayMeta = truncate(meta.trim() || 'Meta-description aparece aqui…', 160);

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
        Pré-visualização no Google
      </span>
      <div className="rounded-lg bg-white p-4 shadow-sm" style={{ fontFamily: 'arial, sans-serif' }}>
        <div className="text-xs leading-snug">
          <span style={{ color: '#202124' }}>blog.stlflix.com</span>
          <span style={{ color: '#5f6368' }} className="mx-1">›</span>
          <span style={{ color: '#006621' }}>{displaySlug}</span>
        </div>
        <h3
          style={{ color: '#1a0dab' }}
          className="text-lg leading-snug mt-1 cursor-pointer hover:underline truncate"
        >
          {displayTitle}
        </h3>
        <p style={{ color: '#4d5156' }} className="text-sm leading-snug mt-1">
          {displayMeta}
        </p>
      </div>
    </div>
  );
}
