jest.mock('@/data/designs', () => ({
  __esModule: true,
  loadDesigns: jest.fn(async () => []),
  loadDesignData: jest.fn(async () => null),
}));

import { filterByCollection, groupByCollection } from '../useDesignCatalog';
import type { TransformedDesign } from '../../types/design';

const makeDesign = (slug: string, collection?: string, categories = ['test']): TransformedDesign =>
  ({
    slug,
    name: slug,
    categories,
    collection: (collection ?? 'web') as TransformedDesign['collection'],
    appTargets: [],
    colors: { primary: '0 0% 50%', secondary: '0 0% 90%' },
    defaultMode: 'dark',
    jsonUrl: `https://luongnv.com/sleek-ui/designs/${slug}.json`,
    thumbnailUrl: '',
    detailUrl: `/designs/${slug}`,
    description: 'test',
  }) as TransformedDesign;

describe('useDesignCatalog collection filtering (#181)', () => {
  const catalog = [
    makeDesign('web-a', 'web'),
    makeDesign('web-b'),
    makeDesign('terminal-pi-dracula', 'terminal'),
    makeDesign('coding-vscode-tokyo-night', 'coding'),
    makeDesign('aura', 'terminal', ['terminal', 'coding', 'dark']),
  ];

  it('groups designs into web, terminal and coding collections', () => {
    const grouped = groupByCollection(catalog);
    expect(grouped.web.map(d => d.slug).sort()).toEqual(['web-a', 'web-b']);
    expect(grouped.terminal.map(d => d.slug)).toEqual(['terminal-pi-dracula', 'aura']);
    expect(grouped.coding.map(d => d.slug)).toEqual(['coding-vscode-tokyo-night', 'aura']);
  });

  it('defaults missing collection to web', () => {
    expect(filterByCollection(catalog, 'web').map(d => d.slug).sort()).toEqual(['web-a', 'web-b']);
  });

  it('filters terminal and coding collections independently', () => {
    expect(filterByCollection(catalog, 'terminal').map(d => d.slug)).toEqual([
      'terminal-pi-dracula',
      'aura',
    ]);
    expect(filterByCollection(catalog, 'coding').map(d => d.slug)).toEqual([
      'coding-vscode-tokyo-night',
      'aura',
    ]);
  });

  it('returns everything for the all filter', () => {
    expect(filterByCollection(catalog, 'all')).toHaveLength(5);
  });
});
