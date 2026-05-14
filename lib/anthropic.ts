import Anthropic from '@anthropic-ai/sdk';
import { marked } from 'marked';
import { STLFLIX_SYSTEM_PROMPT, buildUserPrompt, SUBMIT_ARTICLE_TOOL } from './prompts';
import type { FAQItem, HowToStep } from './types';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface GeneratedArticle {
  // Campos canônicos (primeira variante eleita como default)
  title: string;
  metaDescription: string;
  bodyMd: string;
  bodyHtml: string;
  keywords: string[];
  wordCount: number;

  // SEO/GEO
  titleVariants: string[];
  metaVariants: string[];
  slug: string;
  primaryKeyword: string;
  tldr: string[];
  faq: FAQItem[];
  isTutorial: boolean;
  howtoSteps: HowToStep[] | null;
  ogImageAlt: string;
}

function countWords(text: string): number {
  return text
    .replace(/#{1,6}\s/g, ' ')
    .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1')
    .replace(/`[^`]+`/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .split(/\s+/)
    .filter(Boolean).length;
}

function asString(v: unknown, max?: number): string {
  const s = (typeof v === 'string' ? v : '').trim();
  return typeof max === 'number' ? s.slice(0, max) : s;
}

function asStringArray(v: unknown, opts?: { itemMax?: number; max?: number }): string[] {
  if (!Array.isArray(v)) return [];
  const arr = v.map((item) => asString(item, opts?.itemMax)).filter(Boolean);
  return typeof opts?.max === 'number' ? arr.slice(0, opts.max) : arr;
}

function asFAQ(v: unknown): FAQItem[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((item) => {
      if (typeof item !== 'object' || item === null) return null;
      const o = item as Record<string, unknown>;
      const question = asString(o.question);
      const answer = asString(o.answer);
      if (!question || !answer) return null;
      return { question, answer };
    })
    .filter((x): x is FAQItem => x !== null);
}

function asHowToSteps(v: unknown): HowToStep[] | null {
  if (!Array.isArray(v) || v.length === 0) return null;
  const steps = v
    .map((item) => {
      if (typeof item !== 'object' || item === null) return null;
      const o = item as Record<string, unknown>;
      const name = asString(o.name);
      const text = asString(o.text);
      if (!name || !text) return null;
      return { name, text };
    })
    .filter((x): x is HowToStep => x !== null);
  return steps.length > 0 ? steps : null;
}

export async function generateArticle(transcriptionText: string): Promise<GeneratedArticle> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8192,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    system: [{ type: 'text', text: STLFLIX_SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }] as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tools: [SUBMIT_ARTICLE_TOOL as any],
    tool_choice: { type: 'tool', name: SUBMIT_ARTICLE_TOOL.name },
    messages: [{ role: 'user', content: buildUserPrompt(transcriptionText) }],
  });

  const toolUseBlock = message.content.find((b) => b.type === 'tool_use');
  if (!toolUseBlock || toolUseBlock.type !== 'tool_use') {
    throw new Error('Claude não retornou o tool_use esperado');
  }

  const data = toolUseBlock.input as Record<string, unknown>;

  const titleVariants = asStringArray(data.title_variants, { itemMax: 60, max: 3 });
  const metaVariants = asStringArray(data.meta_variants, { itemMax: 160, max: 2 });
  const tldr = asStringArray(data.tldr, { itemMax: 120, max: 5 });
  const keywords = asStringArray(data.keywords, { max: 5 });
  const faq = asFAQ(data.faq);
  const bodyMd = asString(data.body_md);
  const isTutorial = data.is_tutorial === true;
  const howtoSteps = isTutorial ? asHowToSteps(data.howto_steps) : null;

  const title = titleVariants[0] ?? '';
  const metaDescription = metaVariants[0] ?? '';
  const bodyHtml = String(marked.parse(bodyMd));
  const wordCount = countWords(bodyMd);

  return {
    title,
    metaDescription,
    bodyMd,
    bodyHtml,
    keywords,
    wordCount,
    titleVariants,
    metaVariants,
    slug: asString(data.slug),
    primaryKeyword: asString(data.primary_keyword),
    tldr,
    faq,
    isTutorial,
    howtoSteps,
    ogImageAlt: asString(data.og_image_alt, 125),
  };
}
