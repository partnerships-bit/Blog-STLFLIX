import type { ArticleImagePlan, ArticleImagePlanItem } from './types';

// Normaliza texto pra comparação fuzzy: lowercase, remove acentos, colapsa espaços.
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Strip tags HTML do texto de um heading
function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, '');
}

function escapeAttr(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function figureHtml(img: ArticleImagePlanItem): string {
  if (!img.generated_url) return '';
  const alt = escapeAttr(img.alt_text || img.visual_description || '');
  const caption = img.alt_text || img.visual_description || '';
  return `\n<figure class="article-figure">\n  <img src="${escapeAttr(img.generated_url)}" alt="${alt}" loading="lazy" />\n${caption ? `  <figcaption>${escapeAttr(caption)}</figcaption>\n` : ''}</figure>\n`;
}

// Encontra todas as posições de </h2> no html, retorna [{ headingText, endIndex }]
interface HeadingHit {
  headingText: string;
  normalizedText: string;
  startIndex: number; // posição do <h2>
  endIndex: number;   // posição APÓS </h2>
}

function findH2s(html: string): HeadingHit[] {
  const rx = /<h2[^>]*>([\s\S]*?)<\/h2>/gi;
  const hits: HeadingHit[] = [];
  let m: RegExpExecArray | null;
  while ((m = rx.exec(html)) !== null) {
    hits.push({
      headingText: stripTags(m[1]).trim(),
      normalizedText: normalize(stripTags(m[1])),
      startIndex: m.index,
      endIndex: m.index + m[0].length,
    });
  }
  return hits;
}

// Decide o índice (offset no html) onde inserir a figure de uma imagem.
// Retorna null se não tem onde casar.
function findInsertPoint(html: string, headings: HeadingHit[], img: ArticleImagePlanItem): number | null {
  const isHero = img.image_number === 1 || img.image_type === 'hero image';
  if (isHero) {
    // Hero antes do primeiro H2
    return headings.length > 0 ? headings[0].startIndex : 0;
  }

  // Tenta casar pela section_reference (contains, normalizado)
  if (img.section_reference) {
    const needle = normalize(img.section_reference);
    if (needle) {
      const hit = headings.find((h) => h.normalizedText.includes(needle) || needle.includes(h.normalizedText));
      if (hit) return hit.endIndex;
    }
  }

  // Fallback: tenta casar trechos do placement
  if (img.placement) {
    const placement = normalize(img.placement);
    if (placement.includes('conclus') || placement.includes('final')) {
      // Antes da última seção (último h2)
      return headings.length > 0 ? headings[headings.length - 1].startIndex : null;
    }
    if (placement.includes('introdu') || placement.includes('início') || placement.includes('inicio')) {
      return headings.length > 0 ? headings[0].startIndex : null;
    }
  }

  return null;
}

export function injectPlanImages(bodyHtml: string, plan: ArticleImagePlan | null): string {
  if (!plan || !plan.images || plan.images.length === 0) return bodyHtml;

  const generated = plan.images.filter((i) => i.generated_url);
  if (generated.length === 0) return bodyHtml;

  const headings = findH2s(bodyHtml);
  if (headings.length === 0) {
    // Sem H2s — só append todas no fim
    return bodyHtml + generated.map(figureHtml).join('');
  }

  // Coleta (offset, html) e aplica em ordem decrescente pra não invalidar índices
  const inserts: { offset: number; html: string }[] = [];
  const unmatched: ArticleImagePlanItem[] = [];

  for (const img of generated) {
    const offset = findInsertPoint(bodyHtml, headings, img);
    if (offset === null) {
      unmatched.push(img);
    } else {
      inserts.push({ offset, html: figureHtml(img) });
    }
  }

  // Distribui as não casadas entre H2s do meio (pula primeiro e último)
  if (unmatched.length > 0 && headings.length > 2) {
    const middle = headings.slice(1, -1);
    unmatched.forEach((img, idx) => {
      const target = middle[idx % middle.length];
      inserts.push({ offset: target.endIndex, html: figureHtml(img) });
    });
  } else if (unmatched.length > 0) {
    // Só 1-2 h2s — joga depois do último
    unmatched.forEach((img) => {
      inserts.push({ offset: headings[headings.length - 1].endIndex, html: figureHtml(img) });
    });
  }

  // Ordena decrescente por offset e aplica
  inserts.sort((a, b) => b.offset - a.offset);
  let result = bodyHtml;
  for (const ins of inserts) {
    result = result.slice(0, ins.offset) + ins.html + result.slice(ins.offset);
  }

  return result;
}
