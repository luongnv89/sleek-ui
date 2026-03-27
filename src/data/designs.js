import neoBrutalist from '../../public/designs/neo-brutalist.json';
import warmSaas from '../../public/designs/warm-saas.json';
import editorialDark from '../../public/designs/editorial-dark.json';

const GITHUB_PAGES_BASE = 'https://luongnv89.github.io/sleek-ui';

const transformDesign = (designJson) => {
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
    defaultMode: designJson.defaultMode || 'light',
    jsonUrl: `${GITHUB_PAGES_BASE}/designs/${slug}.json`,
    thumbnailUrl: designJson.preview?.thumbnail 
      ? `${GITHUB_PAGES_BASE}${designJson.preview.thumbnail}`
      : `${GITHUB_PAGES_BASE}/previews/${slug}-thumb.svg`,
    detailUrl: `/designs/${slug}`,
  };
};

const designs = [
  transformDesign(neoBrutalist),
  transformDesign(warmSaas),
  transformDesign(editorialDark),
];

export default designs;
