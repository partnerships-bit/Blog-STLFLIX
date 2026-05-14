'use client';

interface MetaVariantPickerProps {
  variants: string[];
  selected: string;
  onSelect: (variant: string) => void;
}

export function MetaVariantPicker({ variants, selected, onSelect }: MetaVariantPickerProps) {
  if (variants.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
        Variações de meta-description — clique pra trocar
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {variants.map((variant, i) => {
          const active = variant === selected;
          return (
            <button
              key={`${i}-${variant.slice(0, 20)}`}
              type="button"
              onClick={() => onSelect(variant)}
              className={`
                text-left text-xs px-3 py-2.5 rounded-lg border transition-colors
                ${active
                  ? 'border-orange-500 bg-orange-500/10 text-white'
                  : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-500'}
              `}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase tracking-wide text-slate-500">
                  Opção {i + 1}
                </span>
                {active && (
                  <span className="text-[10px] uppercase tracking-wide text-orange-300">
                    ativa
                  </span>
                )}
              </div>
              <span className="block line-clamp-3 leading-snug">{variant}</span>
              <span className="block mt-1 text-[10px] text-slate-500">
                {variant.length}/160 chars
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
