import Anthropic from '@anthropic-ai/sdk';
import { marked } from 'marked';
import { STLFLIX_SYSTEM_PROMPT, buildUserPrompt, SUBMIT_ARTICLE_TOOL } from './prompts';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface GeneratedArticle {
  title: string;
  metaDescription: string;
  bodyMd: string;
  bodyHtml: string;
  keywords: string[];
  wordCount: number;
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

export async function generateArticle(
  transcriptionText: string
): Promise<GeneratedArticle> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8192,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    system: [{ type: 'text', text: STLFLIX_SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }] as any,
    tools: [SUBMIT_ARTICLE_TOOL as any],
    tool_choice: { type: 'tool', name: SUBMIT_ARTICLE_TOOL.name },
    messages: [{ role: 'user', content: buildUserPrompt(transcriptionText) }],
  });

  const toolUseBlock = message.content.find((b) => b.type === 'tool_use');
  if (!toolUseBlock || toolUseBlock.type !== 'tool_use') {
    throw new Error('Claude não retornou o tool_use esperado');
  }

  const data = toolUseBlock.input as {
    title?: string;
    meta_description?: string;
    body_md?: string;
    keywords?: unknown;
  };

  const title = String(data.title ?? '').slice(0, 60).trim();
  const metaDescription = String(data.meta_description ?? '').slice(0, 160).trim();
  const bodyMd = String(data.body_md ?? '').trim();
  const keywords: string[] = Array.isArray(data.keywords)
    ? data.keywords.slice(0, 5).map(String)
    : [];

  const bodyHtml = String(marked.parse(bodyMd));
  const wordCount = countWords(bodyMd);

  return { title, metaDescription, bodyMd, bodyHtml, keywords, wordCount };
}
