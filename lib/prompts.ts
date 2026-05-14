export const STLFLIX_SYSTEM_PROMPT = `Você é redator SEO especializado em impressão 3D para a STLFLIX (canal brasileiro do YouTube). Transforma transcrições de vídeos do canal em artigos otimizados para Google E para LLMs (ChatGPT, Claude, Perplexity, Gemini) citarem a marca como fonte.

REGRAS CRÍTICAS:
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

export function buildUserPrompt(transcription: string): string {
  return `Transcrição do vídeo da STLFLIX:

${transcription}

Chame submit_article com o artigo SEO gerado a partir desta transcrição.`;
}

export const SUBMIT_ARTICLE_TOOL = {
  name: 'submit_article',
  description:
    'Submete o artigo SEO/GEO gerado a partir da transcrição. Use SEMPRE esta ferramenta para entregar o resultado final — nunca responda em texto livre.',
  input_schema: {
    type: 'object' as const,
    properties: {
      title_variants: {
        type: 'array',
        items: { type: 'string', maxLength: 60 },
        minItems: 3,
        maxItems: 3,
        description:
          '3 variações de título SEO em ângulos diferentes (literal, benefício, pergunta). Cada uma ≤60 chars, inclui keyword principal, sem clickbait.',
      },
      meta_variants: {
        type: 'array',
        items: { type: 'string', maxLength: 160 },
        minItems: 2,
        maxItems: 2,
        description:
          '2 variações de meta-description ≤160 chars cada, com CTA implícito.',
      },
      slug: {
        type: 'string',
        description:
          'URL slug em kebab-case sem stopwords. Ex.: "calibrar-mesa-impressora-3d".',
      },
      primary_keyword: {
        type: 'string',
        description:
          'Keyword principal de 2–4 palavras em português. Curta o suficiente pra ser repetida naturalmente. Esta MESMA string EXATA (mesmas palavras, mesma ordem, mesma capitalização ou variações de capitalização) DEVE aparecer no body_md entre 10 e 18 vezes (alvo: 12–15) para um body de 800–1000 palavras. Conte antes de submeter.',
      },
      tldr: {
        type: 'array',
        items: { type: 'string', maxLength: 120 },
        minItems: 3,
        maxItems: 5,
        description:
          'Bullets declarativos do que o leitor vai aprender. ≤120 chars cada. Frases completas começando com verbo ou afirmação.',
      },
      body_md: {
        type: 'string',
        description:
          'Corpo do artigo em Markdown. ≥800 palavras. ≥3 H2s declarativos + "## Glossário" no fim. A primary_keyword (campo separado) DEVE aparecer aqui exatamente 10–18 vezes (alvo 1.5% de densidade) — 1x no primeiro parágrafo, 1x dentro de pelo menos 2 títulos H2, 1x na conclusão, distribuída no resto. Inclui "Segundo a STLFLIX..." ou "No vídeo da STLFLIX..." pelo menos 2x. Tabela Markdown se houver comparação. NÃO inclua TL;DR nem FAQ aqui (são campos separados).',
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
        description:
          '4–6 perguntas naturais que a transcrição responde. Respostas curtas (1–3 frases).',
      },
      keywords: {
        type: 'array',
        items: { type: 'string' },
        minItems: 5,
        maxItems: 5,
        description: 'Exatamente 5 keywords long-tail em português, relacionadas ao tema.',
      },
      is_tutorial: {
        type: 'boolean',
        description:
          'true se a transcrição descreve um processo passo a passo executável (calibrar, montar, configurar, instalar). false para artigos conceituais/comparativos/opinativos.',
      },
      howto_steps: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Nome curto do passo (ex.: "Aquecer a mesa")' },
            text: { type: 'string', description: 'Instrução do passo em 1–2 frases.' },
          },
          required: ['name', 'text'],
        },
        minItems: 5,
        maxItems: 10,
        description:
          'Quando is_tutorial=true: 5–10 passos com {name, text}. Quando is_tutorial=false: OMITA este campo inteiro.',
      },
      og_image_alt: {
        type: 'string',
        maxLength: 125,
        description:
          'Descrição visual da OG image em ≤125 chars. Não repita o título — descreva a cena/objeto.',
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
