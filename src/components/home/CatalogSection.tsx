import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SearchBar } from '@/components/ui/SearchBar';
import { CategoryFilter } from '@/components/ui/CategoryFilter';
import { DesignCard } from '@/components/catalog/DesignCard';
import { useDesignCatalog, type CollectionFilter } from '@/hooks/useDesignCatalog';

const COLLECTION_TABS: Array<{ id: CollectionFilter; label: string }> = [
  { id: 'web', label: 'Web' },
  { id: 'terminal', label: 'Terminal' },
  { id: 'coding', label: 'Coding' },
];

export function CatalogSection() {
  const [searchValue, setSearchValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeCollection, setActiveCollection] = useState<CollectionFilter>('web');
  const { designs, loading, counts, total } = useDesignCatalog(activeCollection);

  const categories = useMemo(
    () =>
      Object.entries(
        designs.flatMap(d => d.categories).reduce((acc, cat) => {
          acc[cat] = (acc[cat] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).map(([id, count]) => ({ id, label: id, count })),
    [designs]
  );

  const filteredDesigns = useMemo(
    () =>
      designs.filter(d => {
        const matchesSearch = !searchValue || d.name.toLowerCase().includes(searchValue.toLowerCase());
        const matchesCategory = !selectedCategory || d.categories.includes(selectedCategory);
        return matchesSearch && matchesCategory;
      }),
    [designs, searchValue, selectedCategory]
  );

  return (
    <section
      id="catalog"
      aria-labelledby="catalog-heading"
      className="border-t border-border/60 bg-background px-gutter py-band sm:py-band-lg"
    >
      <div className="mx-auto max-w-wide space-y-flow">
        <div className="flex flex-col gap-stack sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-eyebrow uppercase text-primary">The catalog</p>
            <h2
              id="catalog-heading"
              className="mt-stack text-headline font-extrabold text-foreground sm:text-display"
            >
              Choose your system
            </h2>
            <p className="mt-stack text-lede text-muted-foreground">
              Every design includes light + dark tokens, typography, and agent instructions. Start here.
            </p>
          </div>
          <span className="text-label tabular-nums text-muted-foreground">
            {filteredDesigns.length} / {total} designs
          </span>
        </div>

        <div role="group" aria-label="Filter by collection" className="flex flex-wrap gap-2">
          {COLLECTION_TABS.map(tab => (
            <Button
              key={tab.id}
              type="button"
              size="sm"
              variant={activeCollection === tab.id ? 'default' : 'outline'}
              aria-pressed={activeCollection === tab.id}
              onClick={() => { setActiveCollection(tab.id); setSelectedCategory(null); setSearchValue(''); }}
              className="min-h-[44px] gap-1.5 rounded-full px-4 text-label"
            >
              {tab.label}
              <Badge
                variant={activeCollection === tab.id ? 'secondary' : 'accent'}
                className="px-1.5 text-micro font-medium tabular-nums"
              >
                {counts[tab.id as 'web' | 'terminal' | 'coding'] ?? 0}
              </Badge>
            </Button>
          ))}
        </div>

        <SearchBar
          value={searchValue}
          onChange={setSearchValue}
          placeholder="Search by name, brand, or style..."
        />

        <CategoryFilter
          categories={categories}
          selected={selectedCategory}
          onChange={setSelectedCategory}
        />

        {loading ? (
          <p className="py-band text-center text-muted-foreground" role="status">Loading designs…</p>
        ) : filteredDesigns.length > 0 ? (
          <div className="grid grid-cols-1 gap-stack sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {filteredDesigns.map((design) => (
              <DesignCard key={design.slug} design={design} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-stack py-band text-center text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p>No designs match your search.</p>
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={() => { setSearchValue(''); setSelectedCategory(null); }}
              className="min-h-[44px] text-label"
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
