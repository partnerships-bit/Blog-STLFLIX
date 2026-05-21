import Anthropic from '@anthropic-ai/sdk';
import {
  IMAGE_PLAN_SYSTEM_PROMPT,
  SUBMIT_IMAGE_PLAN_TOOL,
  buildImagePlanUserPrompt,
} from './prompts';
import type { ArticleImagePlan, ArticleImagePlanItem, ImagePriority, Language } from './types';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface GenerateImagePlanArgs {
  title: string;
  bodyMd: string;
  primaryKeyword: string;
  keywords: string[];
  language: Language;
  wordCount: number;
  isTutorial: boolean;
}

const VALID_PRIORITIES: ImagePriority[] = ['high', 'medium', 'low'];

function asString(v: unknown, max?: number): string {
  const s = (typeof v === 'string' ? v : '').trim();
  return typeof max === 'number' ? s.slice(0, max) : s;
}

function asPriority(v: unknown): ImagePriority {
  return VALID_PRIORITIES.includes(v as ImagePriority) ? (v as ImagePriority) : 'medium';
}

function parsePlan(input: Record<string, unknown>): ArticleImagePlan {
  const recommended = Number.isFinite(input.recommended_image_count)
    ? Math.max(0, Math.min(12, input.recommended_image_count as number))
    : 0;

  const notes = Array.isArray(input.strategy_notes)
    ? (input.strategy_notes as unknown[]).map((n) => asString(n)).filter(Boolean)
    : [];

  const rawImages = Array.isArray(input.images) ? (input.images as unknown[]) : [];

  const images: ArticleImagePlanItem[] = rawImages
    .map((item, idx): ArticleImagePlanItem | null => {
      if (typeof item !== 'object' || item === null) return null;
      const o = item as Record<string, unknown>;
      const placement = asString(o.placement);
      const purpose = asString(o.purpose);
      const visualDescription = asString(o.visual_description);
      const imagePrompt = asString(o.image_prompt);
      const altText = asString(o.alt_text, 125);

      // Filtra entradas claramente vazias
      if (!placement && !purpose && !imagePrompt) return null;

      return {
        image_number: Number.isFinite(o.image_number) ? (o.image_number as number) : idx + 1,
        placement,
        section_reference: asString(o.section_reference),
        purpose,
        image_type: asString(o.image_type) || 'detail shot',
        visual_description: visualDescription,
        image_prompt: imagePrompt,
        alt_text: altText,
        seo_filename: asString(o.seo_filename),
        priority: asPriority(o.priority),
        generated_url: null,
        history: [],
      };
    })
    .filter((x): x is ArticleImagePlanItem => x !== null);

  return {
    recommended_image_count: recommended || images.length,
    strategy_notes: notes,
    images,
  };
}

export async function generateImagePlan(args: GenerateImagePlanArgs): Promise<ArticleImagePlan> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    system: [{ type: 'text', text: IMAGE_PLAN_SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }] as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tools: [SUBMIT_IMAGE_PLAN_TOOL as any],
    tool_choice: { type: 'tool', name: SUBMIT_IMAGE_PLAN_TOOL.name },
    messages: [{ role: 'user', content: buildImagePlanUserPrompt(args) }],
  });

  const toolUse = message.content.find((b) => b.type === 'tool_use');
  if (!toolUse || toolUse.type !== 'tool_use') {
    throw new Error('Claude não retornou o tool_use esperado para o plano de imagens');
  }

  return parsePlan(toolUse.input as Record<string, unknown>);
}
