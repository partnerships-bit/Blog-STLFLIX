import { extractVideoId } from './youtube';
import type { FAQItem, HowToStep, Language } from './types';

const PUBLISHER = {
  '@type': 'Organization',
  name: 'STLFLIX',
  url: 'https://blog.stlflix.com',
};

const AUTHOR = {
  '@type': 'Person',
  name: 'Karol Miranda',
};

interface BuildJsonLdOptions {
  title: string;
  metaDescription: string;
  sourceUrl: string;
  slug?: string;
  keywords: string[];
  wordCount: number;
  faq: FAQItem[];
  isTutorial: boolean;
  howtoSteps: HowToStep[] | null;
  language: Language;
  generatedAt?: Date;
}

export function buildJsonLd(opts: BuildJsonLdOptions): Record<string, unknown> {
  const datePublished = (opts.generatedAt ?? new Date()).toISOString();
  const pageUrl = opts.slug
    ? `https://blog.stlflix.com/${opts.slug}`
    : 'https://blog.stlflix.com';
  // Video is always spoken in pt-BR; only the written article changes language.
  const articleLang = opts.language;
  const videoLang = 'pt-BR';

  const graph: Record<string, unknown>[] = [];

  graph.push({
    '@type': 'Article',
    headline: opts.title,
    description: opts.metaDescription,
    author: AUTHOR,
    publisher: PUBLISHER,
    datePublished,
    keywords: opts.keywords.join(', '),
    wordCount: opts.wordCount,
    inLanguage: articleLang,
    mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
  });

  const videoId = extractVideoId(opts.sourceUrl);
  const videoObject: Record<string, unknown> = {
    '@type': 'VideoObject',
    name: opts.title,
    description: opts.metaDescription,
    contentUrl: opts.sourceUrl,
    embedUrl: opts.sourceUrl,
    uploadDate: datePublished,
    inLanguage: videoLang,
  };
  if (videoId) {
    videoObject.thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }
  graph.push(videoObject);

  if (opts.faq.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: opts.faq.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    });
  }

  if (opts.isTutorial && opts.howtoSteps && opts.howtoSteps.length > 0) {
    graph.push({
      '@type': 'HowTo',
      name: opts.title,
      description: opts.metaDescription,
      inLanguage: articleLang,
      step: opts.howtoSteps.map((s, i) => ({
        '@type': 'HowToStep',
        position: i + 1,
        name: s.name,
        text: s.text,
      })),
    });
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
}
