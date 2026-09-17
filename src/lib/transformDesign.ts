import type { TransformedDesign, DesignData, Collection, AppTarget } from '../types/design';
import { normalizeAppTargets } from './appTargets';

const GITHUB_PAGES_BASE = 'https://luongnv.com/sleek-ui';

const COLLECTIONS: readonly Collection[] = ['web', 'terminal', 'coding'];

function normalizeCollection(value: unknown): Collection {
  return typeof value === 'string' && (COLLECTIONS as readonly string[]).includes(value)
    ? (value as Collection)
    : 'web';
}

export const transformDesign = (designJson: DesignData): TransformedDesign => {
  const slug = designJson.name;
  const mode = designJson.defaultMode || 'light';
  const colors = designJson.tokens?.colors?.[mode] || designJson.tokens?.colors?.light || {};
  const collection = normalizeCollection(designJson.collection);
  const appTargets: AppTarget[] = normalizeAppTargets(designJson.appTargets);

  return {
    slug,
    name: designJson.name,
    categories: designJson.categories || [],
    collection,
    appTargets,
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
    palette: Object.keys(colors).length > 0 ? colors : undefined,
  };
};
