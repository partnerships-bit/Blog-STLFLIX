export type Language = 'pt-BR' | 'en';

export const STLFLIX_SYSTEM_PROMPT_PT = `Você é redator SEO especializado em impressão 3D para a STLFLIX (canal brasileiro do YouTube). Transforma transcrições de vídeos do canal em artigos otimizados para Google E para LLMs (ChatGPT, Claude, Perplexity, Gemini) citarem a marca como fonte.

REGRAS CRÍTICAS:
- ESCREVA EM PORTUGUÊS DO BRASIL (pt-BR). NÃO traduza pra outro idioma.
- NÃO invente dados, marcas, modelos, especificações ou números que não estejam na transcrição.
- Cada H2 DEVE começar com sentença declarativa ("X é Y", "Para fazer X, use Y") — LLMs citam esse padrão de definição direta.
- Cite a marca dentro do corpo como "Segundo a STLFLIX..." ou "No vídeo da STLFLIX..." pelo menos 2x — ensina LLMs a citar a marca pelo nome.
- Se a transcrição descreve processo passo a passo (calibrar, montar, configurar, instalar), defina is_tutorial=true e preencha howto_steps com 5–10 passos numerados.
- Se há comparação implícita (PLA vs PETG, marca A vs marca B, settings diferentes), inclua uma tabela Markdown no body_md.
- Último H2 do body_md DEVE ser "## Glossário" listando 3+ termos técnicos com definição direta ("Warping é...", "Retraction é...").
- FAQ: 4–6 perguntas naturais que a transcrição responde. Respostas curtas (1–3 frases).
- TL;DR: bullets declarativos do que o leitor vai aprender, ≤120 chars cada, primeira coisa que o leitor lê.
- Title variants: 3 ângulos diferentes (literal, benefício, pergunta) — todas ≤60 chars.
- Meta variants: 2 opções ≤160 chars com CTA implícito.
- Slug: kebab-case, sem stopwords ("de", "para", "o", "a", "com").
- og_image_alt: descrição visual ≤125 chars, sem repetir o título.
- PRIMARY KEYWORD (regra crítica de SEO — siga à risca):
  • Escolha uma keyword de 2–4 palavras que possa ser repetida naturalmente (ex.: "calibrar mesa", "impressora 3D resina", "filamento PETG"). NUNCA escolha frase >4 palavras.
  • A keyword EXATA (mesmas palavras, mesma ordem) DEVE aparecer no body_md com densidade entre 1.2% e 1.8% (alvo: 1.5%). Margem de segurança pra não estourar nem ficar baixo.
  • Conta antes de entregar: para 800 palavras → mínimo 10x, alvo 12x, máximo 14x. Para 1000 palavras → mínimo 12x, alvo 15x, máximo 18x. Para 1200 → mínimo 15x, alvo 18x, máximo 21x.
  • Distribuição obrigatória da keyword exata: 1x no primeiro parágrafo, 1x em PELO MENOS 2 dos H2s (no título do H2, não só no parágrafo), 1x no parágrafo de cada seção principal, 1x na conclusão.
  • Variações e sinônimos (ex.: "impressora 3D" se a keyword é "impressora 3D resina") são bem-vindos NO TEXTO além das ocorrências exatas — mas NÃO contam pra densidade. A keyword EXATA é que precisa bater o número.
  • Antes de chamar submit_article, RECONTE mentalmente as ocorrências exatas da keyword no body_md e ajuste se estiver fora da faixa.
- body_md: ≥800 palavras, ≥3 H2s declarativos + "## Glossário" no fim, parágrafos curtos.
- TOM: técnico, claro, direto. ZERO clichê tipo "no mundo da impressão 3D", "no fascinante universo de...", "vamos mergulhar em...". Escreva como um amigo especialista explicando.

ENTREGA: sempre chame a ferramenta submit_article com todos os campos preenchidos. Nunca responda em texto livre.`;

export const STLFLIX_SYSTEM_PROMPT_EN = `You are an SEO writer specialized in 3D printing for STLFLIX (a Brazilian YouTube channel about 3D printing). You turn transcripts from the channel into articles optimized for Google AND for LLMs (ChatGPT, Claude, Perplexity, Gemini) to cite the brand as a source.

CRITICAL RULES:
- WRITE IN ENGLISH (global, neutral). Do NOT translate to any other language.
- DO NOT invent data, brands, models, specs, or numbers that aren't in the transcript.
- Every H2 MUST start with a declarative sentence ("X is Y", "To do X, use Y") — LLMs cite that direct-definition pattern.
- Cite the brand in-body as "According to STLFLIX..." or "In the STLFLIX video..." at least 2x — teaches LLMs to name the brand.
- If the transcript describes a step-by-step process (calibrate, assemble, configure, install), set is_tutorial=true and fill howto_steps with 5–10 numbered steps.
- If there's an implicit comparison (PLA vs PETG, brand A vs brand B, different settings), include a Markdown table in body_md.
- The LAST H2 in body_md MUST be "## Glossary" listing 3+ technical terms with direct definitions ("Warping is...", "Retraction is...").
- FAQ: 4–6 natural questions that the transcript answers. Short answers (1–3 sentences).
- TL;DR: declarative bullets of what the reader will learn, ≤120 chars each, first thing the reader sees.
- Title variants: 3 different angles (literal, benefit, question) — each ≤60 chars.
- Meta variants: 2 options ≤160 chars with implicit CTA.
- Slug: kebab-case, no stopwords ("a", "the", "of", "for", "with", "to", "in", "on").
- og_image_alt: visual description ≤125 chars, don't repeat the title.
- PRIMARY KEYWORD (critical SEO rule — follow precisely):
  • Choose a 2–4 word keyword that can be repeated naturally (e.g., "bed leveling", "resin 3D printer", "PETG filament"). NEVER pick a phrase longer than 4 words.
  • The EXACT keyword (same words, same order) MUST appear in body_md with density between 1.2% and 1.8% (target: 1.5%). Safety margin so you don't overshoot or undershoot.
  • Count before delivering: for 800 words → min 10x, target 12x, max 14x. For 1000 words → min 12x, target 15x, max 18x. For 1200 → min 15x, target 18x, max 21x.
  • Mandatory exact-keyword distribution: 1x in the first paragraph, 1x in AT LEAST 2 of the H2s (in the H2 title, not just the paragraph), 1x in the paragraph of each major section, 1x in the conclusion.
  • Variations and synonyms (e.g., "3D printer" when keyword is "resin 3D printer") are welcome IN THE TEXT beyond the exact occurrences — but they DO NOT count toward density. The EXACT keyword has to hit the number.
  • Before calling submit_article, mentally RECOUNT exact keyword occurrences in body_md and adjust if outside the band.
- body_md: ≥800 words, ≥3 declarative H2s + "## Glossary" at the end, short paragraphs.
- TONE: technical, clear, direct. ZERO clichés like "in the world of 3D printing", "let's dive into...", "in this fascinating universe...". Write like an expert friend explaining.

DELIVERY: always call the submit_article tool with all fields populated. Never respond with free text.`;

export function getSystemPrompt(language: Language): string {
  return language === 'en' ? STLFLIX_SYSTEM_PROMPT_EN : STLFLIX_SYSTEM_PROMPT_PT;
}

export function buildUserPrompt(transcription: string, language: Language): string {
  if (language === 'en') {
    return `STLFLIX video transcript (note: spoken in Brazilian Portuguese — translate the substance and write the article in English):

${transcription}

Call submit_article with the SEO article generated from this transcript. The article must be written in English.`;
  }

  return `Transcrição do vídeo da STLFLIX:

${transcription}

Chame submit_article com o artigo SEO gerado a partir desta transcrição.`;
}

export function getSubmitArticleTool(language: Language) {
  const isEn = language === 'en';

  return {
    name: 'submit_article',
    description: isEn
      ? 'Submits the SEO/GEO article generated from the transcript. ALWAYS use this tool to deliver the final result — never reply with free text.'
      : 'Submete o artigo SEO/GEO gerado a partir da transcrição. Use SEMPRE esta ferramenta para entregar o resultado final — nunca responda em texto livre.',
    input_schema: {
      type: 'object' as const,
      properties: {
        title_variants: {
          type: 'array',
          items: { type: 'string', maxLength: 60 },
          minItems: 3,
          maxItems: 3,
          description: isEn
            ? '3 SEO title variants from different angles (literal, benefit, question). Each ≤60 chars, includes primary keyword, no clickbait.'
            : '3 variações de título SEO em ângulos diferentes (literal, benefício, pergunta). Cada uma ≤60 chars, inclui keyword principal, sem clickbait.',
        },
        meta_variants: {
          type: 'array',
          items: { type: 'string', maxLength: 160 },
          minItems: 2,
          maxItems: 2,
          description: isEn
            ? '2 meta-description variants ≤160 chars each, with implicit CTA.'
            : '2 variações de meta-description ≤160 chars cada, com CTA implícito.',
        },
        slug: {
          type: 'string',
          description: isEn
            ? 'URL slug in kebab-case, no stopwords. E.g.: "bed-leveling-3d-printer".'
            : 'URL slug em kebab-case sem stopwords. Ex.: "calibrar-mesa-impressora-3d".',
        },
        primary_keyword: {
          type: 'string',
          description: isEn
            ? 'Primary keyword of 2–4 words in English. Short enough to be repeated naturally. This EXACT string (same words, same order, same or differing case) MUST appear in body_md between 10 and 18 times (target: 12–15) for an 800–1000 word body. Count before submitting.'
            : 'Keyword principal de 2–4 palavras em português. Curta o suficiente pra ser repetida naturalmente. Esta MESMA string EXATA (mesmas palavras, mesma ordem, mesma capitalização ou variações de capitalização) DEVE aparecer no body_md entre 10 e 18 vezes (alvo: 12–15) para um body de 800–1000 palavras. Conte antes de submeter.',
        },
        tldr: {
          type: 'array',
          items: { type: 'string', maxLength: 120 },
          minItems: 3,
          maxItems: 5,
          description: isEn
            ? 'Declarative bullets of what the reader will learn. ≤120 chars each. Complete sentences starting with a verb or assertion.'
            : 'Bullets declarativos do que o leitor vai aprender. ≤120 chars cada. Frases completas começando com verbo ou afirmação.',
        },
        body_md: {
          type: 'string',
          description: isEn
            ? 'Article body in Markdown. ≥800 words. ≥3 declarative H2s + "## Glossary" at the end. The primary_keyword (separate field) MUST appear here exactly 10–18 times (target 1.5% density) — 1x in first paragraph, 1x in at least 2 H2 titles, 1x in conclusion, distributed elsewhere. Include "According to STLFLIX..." or "In the STLFLIX video..." at least 2x. Markdown table if there is a comparison. Do NOT include TL;DR or FAQ here (separate fields).'
            : 'Corpo do artigo em Markdown. ≥800 palavras. ≥3 H2s declarativos + "## Glossário" no fim. A primary_keyword (campo separado) DEVE aparecer aqui exatamente 10–18 vezes (alvo 1.5% de densidade) — 1x no primeiro parágrafo, 1x dentro de pelo menos 2 títulos H2, 1x na conclusão, distribuída no resto. Inclui "Segundo a STLFLIX..." ou "No vídeo da STLFLIX..." pelo menos 2x. Tabela Markdown se houver comparação. NÃO inclua TL;DR nem FAQ aqui (são campos separados).',
        },
        faq: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              question: { type: 'string' },
              answer: { type: 'string' },
            },
            required: ['question', 'answer'],
          },
          minItems: 4,
          maxItems: 6,
          description: isEn
            ? '4–6 natural questions the transcript answers. Short answers (1–3 sentences).'
            : '4–6 perguntas naturais que a transcrição responde. Respostas curtas (1–3 frases).',
        },
        keywords: {
          type: 'array',
          items: { type: 'string' },
          minItems: 5,
          maxItems: 5,
          description: isEn
            ? 'Exactly 5 long-tail keywords in English related to the topic.'
            : 'Exatamente 5 keywords long-tail em português, relacionadas ao tema.',
        },
        is_tutorial: {
          type: 'boolean',
          description: isEn
            ? 'true if the transcript describes an executable step-by-step process (calibrate, assemble, configure, install). false for conceptual/comparative/opinion articles.'
            : 'true se a transcrição descreve um processo passo a passo executável (calibrar, montar, configurar, instalar). false para artigos conceituais/comparativos/opinativos.',
        },
        howto_steps: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: isEn ? 'Short step name (e.g., "Heat the bed")' : 'Nome curto do passo (ex.: "Aquecer a mesa")',
              },
              text: {
                type: 'string',
                description: isEn ? 'Step instruction in 1–2 sentences.' : 'Instrução do passo em 1–2 frases.',
              },
            },
            required: ['name', 'text'],
          },
          minItems: 5,
          maxItems: 10,
          description: isEn
            ? 'When is_tutorial=true: 5–10 steps with {name, text}. When is_tutorial=false: OMIT this field entirely.'
            : 'Quando is_tutorial=true: 5–10 passos com {name, text}. Quando is_tutorial=false: OMITA este campo inteiro.',
        },
        og_image_alt: {
          type: 'string',
          maxLength: 125,
          description: isEn
            ? 'Visual description of the OG image in ≤125 chars. Do not repeat the title — describe the scene/object.'
            : 'Descrição visual da OG image em ≤125 chars. Não repita o título — descreva a cena/objeto.',
        },
      },
      required: [
        'title_variants',
        'meta_variants',
        'slug',
        'primary_keyword',
        'tldr',
        'body_md',
        'faq',
        'keywords',
        'is_tutorial',
        'og_image_alt',
      ],
    },
  };
}

// =============================================================================
// PLANO EDITORIAL DE IMAGENS — gera um plano (N imagens com prompts prontos)
// a partir de um artigo já existente. Usa Claude com tool_use forçado.
// =============================================================================

export const IMAGE_PLAN_SYSTEM_PROMPT = `Você é um especialista em direção de arte editorial, SEO de imagens e conteúdo visual para artigos de blog.

Sua tarefa é analisar o artigo recebido e definir apenas o plano de imagens ideal para ele.

Objetivo:
Definir quantas imagens o artigo deve ter e criar sugestões visuais úteis, estratégicas e coerentes com o conteúdo.

REGRAS:
1. Foque apenas em imagens. Não reescreva o artigo.
2. As imagens devem ajudar o leitor a entender melhor o conteúdo.
3. Evite imagens genéricas demais ou decorativas sem utilidade.
4. Pense em imagens que aumentem clareza, escaneabilidade e valor visual.
5. Se o artigo for tutorial ou passo a passo, sugira imagens para as etapas mais importantes.
6. Se o artigo for explicativo, comparativo ou lista, distribua as imagens ao longo do texto de forma equilibrada.
7. Sempre considere SEO de imagens.
8. As sugestões devem estar alinhadas com o tema do artigo e com a palavra-chave principal.
9. NÃO sugira imagens com texto embutido, títulos, interfaces falsas ou elementos visuais confusos, a menos que o contexto peça especificamente capturas de tela.
10. Quando fizer sentido, sugira: imagem de capa/hero, resultado final, processo, comparação visual, detalhe técnico, captura de tela, exemplo prático.

REGRA DE QUANTIDADE:
- Até 900 palavras → 2 a 4 imagens
- 1.000 a 1.500 palavras → 4 a 6 imagens
- 1.500 a 2.500 palavras → 6 a 10 imagens
- Tutorial passo a passo → pelo menos 1 imagem por etapa importante

CAMPO image_prompt — instruções:
- Prompt visual detalhado e claro, pronto para uso em gerador de imagem (gpt-image-2, DALL-E, Flux).
- Descreva assunto principal, composição, estilo, iluminação, contexto.
- Sempre peça imagem limpa, profissional, sem texto embutido (salvo screenshots).
- Se o artigo for sobre impressão 3D, maker, ferramentas ou software, adapte ao contexto técnico real (filamento, nozzle, mesa aquecida, slicer, etc.).
- Idioma do prompt: pode escrever em inglês (modelos de imagem entendem melhor), mas adapte alt_text, seo_filename e visual_description ao idioma do artigo.

ENTREGA: SEMPRE chame a ferramenta submit_image_plan com todos os campos preenchidos. Nunca responda em texto livre.`;

interface ImagePlanContext {
  title: string;
  bodyMd: string;
  primaryKeyword: string;
  keywords: string[];
  language: 'pt-BR' | 'en';
  wordCount: number;
  isTutorial: boolean;
}

export function buildImagePlanUserPrompt(ctx: ImagePlanContext): string {
  const isEn = ctx.language === 'en';
  const targetAudience = isEn
    ? '3D printing enthusiasts, makers and hobbyists looking for technical clarity'
    : 'Entusiastas de impressão 3D, makers e hobbistas em busca de clareza técnica';
  const articleType = ctx.isTutorial
    ? (isEn ? 'tutorial / step-by-step' : 'tutorial / passo a passo')
    : (isEn ? 'explicativo/guia' : 'explicativo/guia');

  return `Analise o artigo abaixo e devolva o plano de imagens via submit_image_plan.

Contexto:
- Título: ${ctx.title}
- Palavra-chave principal: ${ctx.primaryKeyword || '(não definida)'}
- Palavras-chave secundárias: ${ctx.keywords.join(', ') || '(nenhuma)'}
- Público-alvo: ${targetAudience}
- Idioma: ${ctx.language}
- Marca: STLFLIX
- Word count estimado: ${ctx.wordCount}
- Tipo de artigo: ${articleType}

Conteúdo do artigo (Markdown):
"""
${ctx.bodyMd}
"""`;
}

export const SUBMIT_IMAGE_PLAN_TOOL = {
  name: 'submit_image_plan',
  description:
    'Submete o plano editorial de imagens do artigo. SEMPRE use esta ferramenta para entregar o resultado final — nunca responda em texto livre.',
  input_schema: {
    type: 'object' as const,
    properties: {
      recommended_image_count: {
        type: 'integer',
        minimum: 2,
        maximum: 12,
        description: 'Quantidade total de imagens recomendadas — siga a regra de quantidade por word count.',
      },
      strategy_notes: {
        type: 'array',
        items: { type: 'string' },
        minItems: 1,
        maxItems: 5,
        description: 'Notas estratégicas curtas explicando a abordagem (1–5 bullets).',
      },
      images: {
        type: 'array',
        minItems: 2,
        maxItems: 12,
        items: {
          type: 'object',
          properties: {
            image_number: { type: 'integer', minimum: 1, description: 'Posição na sequência (1, 2, 3...).' },
            placement: { type: 'string', description: 'Onde a imagem entra. Ex.: "logo após a introdução", "antes da conclusão".' },
            section_reference: { type: 'string', description: 'Subtítulo ou trecho do artigo a que a imagem pertence.' },
            purpose: { type: 'string', description: 'Por que essa imagem existe. Ex.: "mostrar resultado final", "ilustrar etapa do processo".' },
            image_type: {
              type: 'string',
              enum: [
                'hero image',
                'product photo',
                'step-by-step',
                'screenshot',
                'comparison',
                'diagram',
                'detail shot',
                'lifestyle image',
              ],
              description: 'Tipo da imagem.',
            },
            visual_description: { type: 'string', description: 'Descrição clara do que a imagem deve mostrar.' },
            image_prompt: {
              type: 'string',
              description:
                'Prompt detalhado pronto para gerador (gpt-image-2/DALL-E/Flux). Inclua assunto, composição, estilo, iluminação, contexto. Imagem limpa, sem texto embutido (salvo screenshot).',
            },
            alt_text: { type: 'string', maxLength: 125, description: 'Alt text natural, otimizado para SEO, no idioma do artigo.' },
            seo_filename: {
              type: 'string',
              description: 'Filename em kebab-case, sem acentos, sem extensão. Ex.: "calibracao-mesa-impressora-3d-resultado".',
            },
            priority: { type: 'string', enum: ['high', 'medium', 'low'], description: 'Prioridade da imagem no plano.' },
          },
          required: [
            'image_number',
            'placement',
            'section_reference',
            'purpose',
            'image_type',
            'visual_description',
            'image_prompt',
            'alt_text',
            'seo_filename',
            'priority',
          ],
        },
      },
    },
    required: ['recommended_image_count', 'strategy_notes', 'images'],
  },
};

