import type { TransformedDesign, DesignData } from '../types/design';

const GITHUB_PAGES_BASE = 'https://luongnv.com/sleek-ui';

const transformDesign = (designJson: DesignData): TransformedDesign => {
  const slug = designJson.name;
  const mode = designJson.defaultMode || 'light';
  const colors = designJson.tokens?.colors?.[mode] || designJson.tokens?.colors?.light || {};

  return {
    slug,
    name: designJson.name,
    categories: designJson.categories || [],
    colors: {
      primary: colors.primary || '',
      secondary: colors.secondary || '',
    },
    defaultMode: (designJson.defaultMode || 'light') as 'light' | 'dark',
    jsonUrl: `${GITHUB_PAGES_BASE}/designs/${slug}.json`,
    thumbnailUrl: designJson.preview?.thumbnail
      ? `${GITHUB_PAGES_BASE}${designJson.preview.thumbnail}`
      : `${GITHUB_PAGES_BASE}/previews/${slug}-thumb.svg`,
    detailUrl: `/designs/${slug}`,
    description: designJson.tokens?.typography?.fontFamily?.sans
      ? `A ${designJson.tokens.typography.fontFamily.sans} based design system`
      : 'A beautiful design system',
    rawData: designJson,
  };
};

const DESIGN_LIST = [
  'neo-brutalist',
  'warm-saas',
  'editorial-dark',
  'swiss-clean',
  'deep-ocean',
  'glassmorphic',
  'airbnb',
  'airtable',
  'apple',
  'bmw',
  'cal',
  'claude',
  'clay',
  'clickhouse',
  'cohere',
  'coinbase',
  'composio',
  'cursor',
  'elevenlabs',
  'expo',
  'figma',
  'framer',
  'hashicorp',
  'ibm',
  'intercom',
  'kraken',
  'linear.app',
  'lovable',
  'minimax',
  'mintlify',
  'miro',
  'mistral.ai',
  'mongodb',
  'notion',
  'nvidia',
  'ollama',
  'opencode.ai',
  'pinterest',
  'posthog',
  'raycast',
  'replicate',
  'resend',
  'revolut',
  'runwayml',
  'sanity',
  'sentry',
  'spacex',
  'spotify',
  'stripe',
  'supabase',
  'superhuman',
  'together.ai',
  'uber',
  'vercel',
  'voltagent',
  'warp',
  'webflow',
  'wise',
  'x.ai',
  'zapier',
];

const designModules = import.meta.glob('./designs/*.json', { eager: true });

const designs: TransformedDesign[] = DESIGN_LIST.map(slug => {
  const moduleKey = `./designs/${slug}.json`;
  const designJson = designModules[moduleKey] as DesignData;
  if (designJson) {
    return transformDesign(designJson);
  }
  return null;
}).filter((d): d is TransformedDesign => d !== null);

export default designs;
