'use client';

import { useState, useEffect } from 'react';
import type { ArticleResult, FAQItem } from '@/lib/types';
import { CopyButtons } from './CopyButtons';
import { SerpPreview } from './SerpPreview';
import { SeoScorePanel } from './SeoScorePanel';
import { TitleVariantPicker } from './TitleVariantPicker';
import { MetaVariantPicker } from './MetaVariantPicker';
import { JsonLdCopyButton } from './JsonLdCopyButton';

interface ArticleEditorProps {
  article: ArticleResult;
  hidden?: boolean;
}

export function ArticleEditor({ article, hidden = false }: ArticleEditorProps) {
  const [title, setTitle] = useState(article.title);
  const [metaDescription, setMetaDescription] = useState(article.metaDescription);
  const [bodyMd, setBodyMd] = useState(article.bodyMd);
  const [keywords, setKeywords] = useState(article.keywords.join(', '));
  const [tldrText, setTldrText] = useState(article.tldr.join('\n'));
  const [faq, setFaq] = useState<FAQItem[]>(article.faq);

  useEffect(() => {
    setTitle(article.title);
    setMetaDescription(article.metaDescription);
    setBodyMd(article.bodyMd);
    setKeywords(article.keywords.join(', '));
    setTldrText(article.tldr.join('\n'));
    setFaq(article.faq);
  }, [article]);

  const keywordsArray = keywords
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);

  const tldr = tldrText
    .split('\n')
    .map((s) => s.trim().replace(/^[-•]\s*/, ''))
    .filter(Boolean);

  const wordCount = bodyMd.split(/\s+/).filter(Boolean).length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  function updateFaqItem(idx: number, field: 'question' | 'answer', value: string) {
    setFaq((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  }

  function addFaqItem() {
    setFaq((prev) => [...prev, { question: '', answer: '' }]);
  }

  function removeFaqItem(idx: number) {
    setFaq((prev) => prev.filter((_, i) => i !== idx));
  }

  const isEn = article.language === 'en';
  const labels = {
    titleSeo: isEn ? 'SEO Title' : 'Título SEO',
    meta: isEn ? 'Meta description' : 'Meta-description',
    tldrHint: isEn ? 'TL;DR — one sentence per line' : 'TL;DR — uma frase por linha',
    bullets: isEn ? 'bullets' : 'bullets',
    body: isEn ? 'Article body (Markdown)' : 'Corpo do artigo (Markdown)',
    faq: 'FAQ',
    questionCount: isEn ? 'questions' : 'perguntas',
    addQuestion: isEn ? '+ Add question' : '+ Adicionar pergunta',
    keywords: isEn ? 'Long-tail keywords (comma-separated)' : 'Palavras-chave long-tail (separadas por vírgula)',
    exportHint: isEn ? 'Export edited article' : 'Exportar artigo editado',
    questionPlaceholder: isEn ? 'Question?' : 'Pergunta?',
    answerPlaceholder: isEn ? 'Answer in 1–3 sentences.' : 'Resposta em 1–3 frases.',
    removeQuestion: isEn ? 'Remove question' : 'Remover pergunta',
  };

  return (
    <div className={hidden ? 'hidden' : ''} aria-hidden={hidden}>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        <div className="flex flex-col gap-6 min-w-0">
          <SerpPreview title={title} slug={article.slug} meta={metaDescription} />

          <div className="flex flex-col gap-3">
            <TitleVariantPicker
              variants={article.titleVariants}
              selected={title}
              onSelect={setTitle}
            />
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  {labels.titleSeo}
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
          </div>

          <div className="flex flex-col gap-3">
            <MetaVariantPicker
              variants={article.metaVariants}
              selected={metaDescription}
              onSelect={setMetaDescription}
            />
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  {labels.meta}
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
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                {labels.tldrHint}
              </label>
              <span className="text-xs text-slate-500">{tldr.length} {labels.bullets}</span>
            </div>
            <textarea
              value={tldrText}
              onChange={(e) => setTldrText(e.target.value)}
              rows={Math.max(4, tldr.length + 1)}
              className="
                w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700
                text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500
                transition-colors resize-y leading-relaxed
              "
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              {labels.body}
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

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                {labels.faq}
              </label>
              <span className="text-xs text-slate-500">{faq.length} {labels.questionCount}</span>
            </div>
            <div className="flex flex-col gap-2">
              {faq.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-slate-700 bg-slate-800/60 p-3 flex flex-col gap-2"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-slate-500 mt-2.5 w-5">{idx + 1}.</span>
                    <input
                      type="text"
                      value={item.question}
                      onChange={(e) => updateFaqItem(idx, 'question', e.target.value)}
                      placeholder={labels.questionPlaceholder}
                      className="
                        flex-1 px-3 py-2 rounded-md bg-slate-800 border border-slate-700
                        text-white text-sm font-medium focus:outline-none focus:ring-2
                        focus:ring-orange-500 transition-colors
                      "
                    />
                    <button
                      type="button"
                      onClick={() => removeFaqItem(idx)}
                      aria-label={labels.removeQuestion}
                      className="
                        h-9 w-9 flex items-center justify-center rounded-md text-slate-500
                        hover:text-red-400 hover:bg-red-500/10 transition-colors text-lg
                      "
                    >
                      ×
                    </button>
                  </div>
                  <textarea
                    value={item.answer}
                    onChange={(e) => updateFaqItem(idx, 'answer', e.target.value)}
                    placeholder={labels.answerPlaceholder}
                    rows={2}
                    className="
                      w-full ml-7 max-w-[calc(100%-1.75rem)] px-3 py-2 rounded-md
                      bg-slate-800 border border-slate-700 text-slate-200 text-sm
                      focus:outline-none focus:ring-2 focus:ring-orange-500
                      transition-colors resize-none
                    "
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addFaqItem}
              className="
                self-start mt-1 px-3 py-1.5 rounded-md text-xs font-medium
                border border-dashed border-slate-600 text-slate-300
                hover:border-slate-400 hover:text-white transition-colors
              "
            >
              {labels.addQuestion}
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              {labels.keywords}
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

          <div className="pt-2 border-t border-slate-800">
            <p className="text-xs text-slate-500 mb-3">{labels.exportHint}</p>
            <div className="flex gap-3 flex-wrap items-center">
              <CopyButtons
                title={title}
                metaDescription={metaDescription}
                bodyMd={bodyMd}
                keywords={keywordsArray}
                tldr={tldr}
                faq={faq}
              />
              <JsonLdCopyButton jsonLd={article.jsonLd} />
            </div>
          </div>
        </div>

        <SeoScorePanel
          title={title}
          meta={metaDescription}
          bodyMd={bodyMd}
          primaryKeyword={article.primaryKeyword}
          tldr={tldr}
          faq={faq}
          wordCount={wordCount}
          readingTimeMinutes={readingTimeMinutes}
        />
      </div>
    </div>
  );
}
