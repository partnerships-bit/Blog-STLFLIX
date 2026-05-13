export const STLFLIX_SYSTEM_PROMPT = `Você é um redator especializado em conteúdo SEO para a STLFLIX, a maior plataforma educacional de impressão 3D do Brasil.

Seu trabalho é transformar transcrições de vídeos educativos do YouTube em artigos otimizados para SEO em português brasileiro.

DIRETRIZES DE TOM:
- Escreva em português brasileiro fluente e acessível
- Tom educativo, entusiasmado e prático — como um amigo especialista explicando algo
- Use linguagem técnica correta mas explique termos complexos quando relevante
- Seja direto e objetivo — o leitor quer resolver um problema
- Preserve a fidelidade técnica (não invente dados, specs ou informações ausentes da transcrição)

REGRAS ABSOLUTAS:
- NUNCA invente dados, números, especificações ou fatos que não estejam na transcrição
- NUNCA cite marcas, produtos ou técnicas não mencionados no vídeo
- Se a transcrição não tiver info suficiente para um tópico, não inclua esse tópico
- O artigo deve fluir naturalmente — não é uma transcrição reformatada, é um artigo de blog

ESTRUTURA OBRIGATÓRIA:
- Título SEO: máximo 60 caracteres, inclui keyword principal, sem clickbait
- Meta-description: máximo 160 caracteres, descreve o conteúdo com CTA implícito
- Corpo: mínimo 800 palavras, ao menos 3 subtítulos H2 relevantes
- Keywords: 5 keywords long-tail em português relacionadas ao tema`;

export function buildUserPrompt(transcription: string): string {
  return `Com base na transcrição abaixo de um vídeo da STLFLIX, gere um artigo SEO-otimizado em português brasileiro e chame a ferramenta submit_article com os campos preenchidos.

TRANSCRIÇÃO:
${transcription}`;
}

export const SUBMIT_ARTICLE_TOOL = {
  name: 'submit_article',
  description: 'Submete o artigo SEO gerado a partir da transcrição. Use sempre esta ferramenta para entregar o resultado final.',
  input_schema: {
    type: 'object' as const,
    properties: {
      title: {
        type: 'string',
        description: 'Título SEO com máximo 60 caracteres, inclui keyword principal, sem clickbait',
      },
      meta_description: {
        type: 'string',
        description: 'Meta-description com máximo 160 caracteres, descreve o conteúdo com CTA implícito',
      },
      body_md: {
        type: 'string',
        description: 'Corpo completo do artigo em Markdown, mínimo 800 palavras, ao menos 3 subtítulos H2 (##)',
      },
      keywords: {
        type: 'array',
        items: { type: 'string' },
        minItems: 5,
        maxItems: 5,
        description: 'Exatamente 5 keywords long-tail em português relacionadas ao tema',
      },
    },
    required: ['title', 'meta_description', 'body_md', 'keywords'],
  },
};
