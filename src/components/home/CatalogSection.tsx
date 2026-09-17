import { useMemo, useState } from 'react';
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
    <section id="catalog" className="px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Choose your system</h2>
            <p className="mt-1.5 text-muted-foreground">
              Every design includes light + dark tokens, typography, and agent instructions. Start here.
            </p>
          </div>
          <span className="text-sm text-muted-foreground tabular-nums">
            {filteredDesigns.length} / {total} designs
          </span>
        </div>

        <div role="group" aria-label="Filter by collection" className="flex flex-wrap gap-2">
          {COLLECTION_TABS.map(tab => (
            <button
              key={tab.id}
              type="button"
              aria-pressed={activeCollection === tab.id}
              onClick={() => { setActiveCollection(tab.id); setSelectedCategory(null); setSearchValue(''); }}
              className={
                activeCollection === tab.id
                  ? 'inline-flex min-h-[44px] items-center rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                  : 'inline-flex min-h-[44px] items-center rounded-full border border-border bg-background px-4 py-1.5 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
              }
            >
              {tab.label} ({counts[tab.id as 'web' | 'terminal' | 'coding'] ?? 0})
            </button>
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
          <p className="py-20 text-center text-muted-foreground" role="status">Loading designs…</p>
        ) : filteredDesigns.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredDesigns.map((design) => (
              <DesignCard key={design.slug} design={design} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-20 text-center text-muted-foreground gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p>No designs match your search.</p>
            <button
              type="button"
              onClick={() => { setSearchValue(''); setSelectedCategory(null); }}
              className="text-sm text-brand hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
