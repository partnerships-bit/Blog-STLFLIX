'use client';

import { useState } from 'react';
import type { ArticleImagePlan, ArticleImagePlanItem, Language } from '@/lib/types';

interface ImagePlanPanelProps {
  articleId: string;
  language: Language;
  initialPlan: ArticleImagePlan | null;
  featuredImageUrl: string | null;
  onSetFeaturedImage: (url: string) => void;
}

const PRIORITY_STYLE: Record<string, string> = {
  high: 'bg-red-500/15 text-red-300 border-red-500/30',
  medium: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  low: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
};

export function ImagePlanPanel({
  articleId,
  language,
  initialPlan,
  featuredImageUrl,
  onSetFeaturedImage,
}: ImagePlanPanelProps) {
  const isEn = language === 'en';
  const [plan, setPlan] = useState<ArticleImagePlan | null>(initialPlan);
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const [generatingSlots, setGeneratingSlots] = useState<Set<number>>(new Set());
  const [restoringSlots, setRestoringSlots] = useState<Set<number>>(new Set());
  const [slotErrors, setSlotErrors] = useState<Record<number, string>>({});
  const [expandedPrompts, setExpandedPrompts] = useState<Set<number>>(new Set());

  const labels = {
    title: isEn ? 'Image Plan' : 'Plano de Imagens',
    subtitle: isEn
      ? 'AI-curated image plan with prompts ready to generate.'
      : 'Plano editorial gerado pela IA com prompts prontos pra usar.',
    planBtn: isEn ? 'Plan Images' : 'Planejar Imagens',
    replanBtn: isEn ? 'Re-plan Images' : 'Replanejar Imagens',
    planning: isEn ? 'Planning...' : 'Planejando...',
    notes: isEn ? 'Strategy notes' : 'Notas de estratégia',
    placement: isEn ? 'Placement' : 'Posição',
    section: isEn ? 'Section' : 'Seção',
    purpose: isEn ? 'Purpose' : 'Objetivo',
    description: isEn ? 'Description' : 'Descrição',
    altText: 'Alt text',
    filename: isEn ? 'Filename' : 'Filename',
    prompt: 'Prompt',
    showPrompt: isEn ? 'Show prompt' : 'Ver prompt',
    hidePrompt: isEn ? 'Hide prompt' : 'Esconder prompt',
    generate: isEn ? 'Generate' : 'Gerar',
    generating: isEn ? 'Generating…' : 'Gerando…',
    regenerate: isEn ? 'Regenerate' : 'Regerar',
    setAsCover: isEn ? 'Set as cover' : 'Definir como capa',
    currentCover: isEn ? 'Current cover' : 'Capa atual',
    copy: isEn ? 'Copy URL' : 'Copiar URL',
    copyMd: isEn ? 'Copy Markdown' : 'Copiar Markdown',
    copied: isEn ? 'Copied!' : 'Copiado!',
    previousVersions: isEn ? 'Previous versions' : 'Versões anteriores',
    restore: isEn ? 'Restore' : 'Restaurar',
    restoring: isEn ? 'Restoring…' : 'Restaurando…',
    empty: isEn
      ? 'No plan yet. Click "Plan Images" to let the AI design a visual plan for this article.'
      : 'Sem plano ainda. Clique em "Planejar Imagens" pra IA desenhar o plano visual.',
  };

  async function handlePlan() {
    setPlanLoading(true);
    setPlanError(null);
    try {
      const res = await fetch('/api/image-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ article_id: articleId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Falha ao gerar plano');
      setPlan(data.imagePlan);
    } catch (err) {
      setPlanError(err instanceof Error ? err.message : 'Erro');
    } finally {
      setPlanLoading(false);
    }
  }

  async function handleGenerateSlot(item: ArticleImagePlanItem) {
    setGeneratingSlots((prev) => new Set(prev).add(item.image_number));
    setSlotErrors((prev) => {
      const next = { ...prev };
      delete next[item.image_number];
      return next;
    });
    try {
      const imgRes = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: item.image_prompt }),
      });
      const imgData = await imgRes.json();
      if (!imgRes.ok || !imgData.url) {
        throw new Error(imgData.error || 'Falha ao gerar imagem');
      }
      // Persiste o URL no slot
      const slotRes = await fetch(`/api/articles/${articleId}/image-slot`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_number: item.image_number, generated_url: imgData.url }),
      });
      const slotData = await slotRes.json();
      if (!slotRes.ok) throw new Error(slotData.error || 'Falha ao salvar slot');
      setPlan(slotData.imagePlan);
    } catch (err) {
      setSlotErrors((prev) => ({
        ...prev,
        [item.image_number]: err instanceof Error ? err.message : 'Erro',
      }));
    } finally {
      setGeneratingSlots((prev) => {
        const next = new Set(prev);
        next.delete(item.image_number);
        return next;
      });
    }
  }

  async function handleRestore(item: ArticleImagePlanItem, url: string) {
    setRestoringSlots((prev) => new Set(prev).add(item.image_number));
    setSlotErrors((prev) => {
      const next = { ...prev };
      delete next[item.image_number];
      return next;
    });
    try {
      const slotRes = await fetch(`/api/articles/${articleId}/image-slot`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_number: item.image_number, generated_url: url }),
      });
      const slotData = await slotRes.json();
      if (!slotRes.ok) throw new Error(slotData.error || 'Falha ao restaurar');
      setPlan(slotData.imagePlan);
    } catch (err) {
      setSlotErrors((prev) => ({
        ...prev,
        [item.image_number]: err instanceof Error ? err.message : 'Erro',
      }));
    } finally {
      setRestoringSlots((prev) => {
        const next = new Set(prev);
        next.delete(item.image_number);
        return next;
      });
    }
  }

  function togglePrompt(n: number) {
    setExpandedPrompts((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  }

  async function copy(text: string, key: string) {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied((c) => (c === key ? null : c)), 1500);
  }
  const [copied, setCopied] = useState<string | null>(null);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
            <span>🎨</span> {labels.title}
          </h3>
          <p className="text-xs text-slate-400 mt-1">{labels.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={handlePlan}
          disabled={planLoading}
          className="
            px-3 py-1.5 rounded bg-orange-500 hover:bg-orange-600 text-white
            text-xs font-semibold transition-colors disabled:opacity-50
            disabled:cursor-not-allowed whitespace-nowrap
          "
        >
          {planLoading ? labels.planning : plan ? labels.replanBtn : labels.planBtn}
        </button>
      </div>

      {planError && (
        <div className="text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 p-2.5 rounded">
          ❌ {planError}
        </div>
      )}

      {!plan && !planLoading && !planError && (
        <div className="text-xs text-slate-500 italic py-4 text-center">
          {labels.empty}
        </div>
      )}

      {plan && (
        <>
          {plan.strategy_notes.length > 0 && (
            <details className="bg-slate-800/50 rounded-lg border border-slate-800 px-3 py-2" open>
              <summary className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider cursor-pointer">
                {labels.notes} ({plan.strategy_notes.length})
              </summary>
              <ul className="mt-2 flex flex-col gap-1.5">
                {plan.strategy_notes.map((note, idx) => (
                  <li key={idx} className="text-[12px] text-slate-300 leading-relaxed">
                    — {note}
                  </li>
                ))}
              </ul>
            </details>
          )}

          <div className="flex flex-col gap-3">
            {plan.images.map((img) => {
              const isGenerating = generatingSlots.has(img.image_number);
              const isRestoring = restoringSlots.has(img.image_number);
              const isBusy = isGenerating || isRestoring;
              const slotErr = slotErrors[img.image_number];
              const promptOpen = expandedPrompts.has(img.image_number);
              const isCover = !!img.generated_url && img.generated_url === featuredImageUrl;
              const markdown = img.generated_url
                ? `![${img.alt_text}](${img.generated_url} "${img.seo_filename}")`
                : '';

              return (
                <div
                  key={img.image_number}
                  className="rounded-lg border border-slate-800 bg-slate-950/50 p-3 flex flex-col gap-3"
                >
                  <div className="flex items-start gap-2 flex-wrap">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      #{img.image_number}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold border ${PRIORITY_STYLE[img.priority] || PRIORITY_STYLE.medium}`}
                    >
                      {img.priority}
                    </span>
                    <span className="text-[11px] text-slate-400 italic">{img.image_type}</span>
                  </div>

                  <dl className="grid grid-cols-[100px_1fr] gap-x-3 gap-y-1.5 text-[11px]">
                    <dt className="text-slate-500 uppercase tracking-wide font-semibold">{labels.placement}</dt>
                    <dd className="text-slate-200">{img.placement}</dd>
                    {img.section_reference && (
                      <>
                        <dt className="text-slate-500 uppercase tracking-wide font-semibold">{labels.section}</dt>
                        <dd className="text-slate-300">{img.section_reference}</dd>
                      </>
                    )}
                    <dt className="text-slate-500 uppercase tracking-wide font-semibold">{labels.purpose}</dt>
                    <dd className="text-slate-300">{img.purpose}</dd>
                    <dt className="text-slate-500 uppercase tracking-wide font-semibold">{labels.description}</dt>
                    <dd className="text-slate-300">{img.visual_description}</dd>
                    <dt className="text-slate-500 uppercase tracking-wide font-semibold">{labels.altText}</dt>
                    <dd className="text-slate-300">{img.alt_text}</dd>
                    <dt className="text-slate-500 uppercase tracking-wide font-semibold">{labels.filename}</dt>
                    <dd className="text-slate-300 font-mono text-[10px]">{img.seo_filename}</dd>
                  </dl>

                  <button
                    type="button"
                    onClick={() => togglePrompt(img.image_number)}
                    className="text-[11px] text-orange-300 hover:text-orange-200 self-start"
                  >
                    {promptOpen ? labels.hidePrompt : labels.showPrompt}
                  </button>
                  {promptOpen && (
                    <div className="rounded bg-slate-900 border border-slate-800 p-2.5 text-[11px] text-slate-300 font-mono leading-relaxed whitespace-pre-wrap">
                      {img.image_prompt}
                    </div>
                  )}

                  {slotErr && (
                    <div className="text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 p-2 rounded">
                      ❌ {slotErr}
                    </div>
                  )}

                  {img.generated_url ? (
                    <div className="flex flex-col gap-2">
                      <div className="relative rounded overflow-hidden border border-slate-700 bg-slate-950 aspect-square">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.generated_url} alt={img.alt_text} className="object-cover w-full h-full" />
                        {isCover && (
                          <span className="absolute top-1 right-1 bg-slate-900/90 text-[10px] text-orange-300 px-2 py-0.5 rounded font-mono border border-orange-500/30">
                            {labels.currentCover}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => onSetFeaturedImage(img.generated_url!)}
                          disabled={isCover}
                          className="
                            py-1.5 rounded text-[11px] font-semibold
                            bg-slate-700 hover:bg-slate-600 text-white transition-colors
                            disabled:opacity-50 disabled:cursor-not-allowed
                          "
                        >
                          {isCover ? `✓ ${labels.currentCover}` : labels.setAsCover}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleGenerateSlot(img)}
                          disabled={isBusy}
                          className="
                            py-1.5 rounded text-[11px] font-medium border border-slate-700
                            bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors
                            disabled:opacity-50
                          "
                        >
                          {isGenerating
                            ? labels.generating
                            : isRestoring
                              ? labels.restoring
                              : `↻ ${labels.regenerate}`}
                        </button>
                        <button
                          type="button"
                          onClick={() => copy(img.generated_url!, `url-${img.image_number}`)}
                          className="
                            py-1.5 rounded text-[11px] font-medium border border-slate-700
                            bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors
                          "
                        >
                          {copied === `url-${img.image_number}` ? labels.copied : labels.copy}
                        </button>
                        <button
                          type="button"
                          onClick={() => copy(markdown, `md-${img.image_number}`)}
                          className="
                            py-1.5 rounded text-[11px] font-medium border border-slate-700
                            bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors
                          "
                        >
                          {copied === `md-${img.image_number}` ? labels.copied : labels.copyMd}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleGenerateSlot(img)}
                      disabled={isBusy}
                      className="
                        py-2 rounded text-xs font-semibold transition-colors
                        bg-orange-500 hover:bg-orange-600 text-white
                        disabled:opacity-50 disabled:cursor-not-allowed
                        flex items-center justify-center gap-2
                      "
                    >
                      {isGenerating ? (
                        <>
                          <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          {labels.generating}
                        </>
                      ) : (
                        <>🎨 {labels.generate}</>
                      )}
                    </button>
                  )}

                  {img.history && img.history.length > 0 && (
                    <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase tracking-wide font-semibold">
                        {labels.previousVersions} ({img.history.length})
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {img.history.map((url) => (
                          <button
                            key={url}
                            type="button"
                            title={labels.restore}
                            onClick={() => handleRestore(img, url)}
                            disabled={isBusy}
                            className="
                              relative shrink-0 w-16 h-16 rounded border border-slate-700
                              overflow-hidden bg-slate-950 hover:border-orange-500/60
                              transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                              group
                            "
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={url} alt="" className="object-cover w-full h-full" />
                            <span className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] text-orange-300 font-semibold">
                              ↻ {labels.restore}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
