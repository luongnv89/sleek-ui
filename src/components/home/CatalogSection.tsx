import { useState } from 'react';
import { SearchBar } from '@/components/ui/SearchBar';
import { CategoryFilter } from '@/components/ui/CategoryFilter';
import { DesignCard } from '@/components/catalog/DesignCard';
import designs from '@/data/designs';

export function CatalogSection() {
  const [searchValue, setSearchValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Object.entries(
    designs.flatMap(d => d.categories).reduce((acc, cat) => {
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([id, count]) => ({ id, label: id, count }));

  const filteredDesigns = designs.filter(d => {
    const matchesSearch = !searchValue || d.name.toLowerCase().includes(searchValue.toLowerCase());
    const matchesCategory = !selectedCategory || d.categories.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

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
            {filteredDesigns.length} / {designs.length} designs
          </span>
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

        {filteredDesigns.length > 0 ? (
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
              onClick={() => { setSearchValue(''); setSelectedCategory(null); }}
              className="text-sm text-[#00FF41] hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
