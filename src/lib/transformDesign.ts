import type { TransformedDesign, DesignData } from '../types/design';

const GITHUB_PAGES_BASE = 'https://luongnv.com/sleek-ui';

export const transformDesign = (designJson: DesignData): TransformedDesign => {
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
    palette: Object.keys(colors).length > 0 ? colors : undefined,
  };
};
