import { HashRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { CopyButton } from '@/components/ui/CopyButton';
import { SearchBar } from '@/components/ui/SearchBar';
import { CategoryFilter } from '@/components/ui/CategoryFilter';
import { DesignDetail } from '@/components/DesignDetail';
import { DesignCard } from '@/components/catalog/DesignCard';
import designs from '@/data/designs';

function App() {
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

  const exampleText = 'https://luongnv89.github.io/sleek-ui/designs/warm-saas.json';

  return (
    <HashRouter>
      <Routes>
        <Route
          path="/"
          element={
            <div className="min-h-screen bg-background p-8">
              <div className="mx-auto max-w-7xl space-y-12">
                <section className="text-center space-y-6 py-12 md:py-20">
                  <div className="flex justify-center mb-6">
                    <img
                      src="/sleek-ui/logo/logo-mark.svg"
                      alt="sleek-ui logo mark"
                      className="h-20 w-20 text-foreground"
                    />
                  </div>
                  <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-6xl">
                    Sleek <span className="text-[#00FF41]">UI</span> Design Systems
                  </h1>
                  <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Beautiful, ready-to-use design systems for your next project.
                    Simply pick a design and apply it to your codebase.
                  </p>
                </section>

                {/* Brand Showcase Link */}
                <section className="text-center">
                  <p className="text-sm text-muted-foreground">
                    View the <a href="/sleek-ui/logo/brand-showcase.html" className="text-[#00FF41] hover:underline">brand showcase</a>
                  </p>
                </section>

                {/* Example Prompt Section */}
                <section className="rounded-lg border bg-card p-6 shadow-sm">
                  <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                    How to use
                  </h2>
                  <p className="mt-4 text-lg text-muted-foreground">
                    Copy the design URL and tell your AI agent to apply it:
                  </p>
                  <div className="mt-6 flex items-center gap-2 rounded-md border bg-muted p-3">
                    <code className="flex-1 break-all text-sm text-muted-foreground">
                      {exampleText}
                    </code>
                    <CopyButton
                      text={exampleText}
                      onCopy={(success) => console.log('Copy success:', success)}
                      className="shrink-0"
                    />
                  </div>
                </section>

                {/* Design Catalog */}
                <section className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                      Available Designs
                    </h2>
                    <span className="text-sm text-muted-foreground">
                      {filteredDesigns.length} / {designs.length} designs
                    </span>
                  </div>

                  <SearchBar
                    value={searchValue}
                    onChange={setSearchValue}
                    placeholder="Search designs..."
                  />

                  <CategoryFilter
                    categories={categories}
                    selected={selectedCategory}
                    onChange={setSelectedCategory}
                  />

                  {filteredDesigns.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredDesigns.map((design) => (
                        <DesignCard key={design.slug} design={design} />
                      ))}
                    </div>
                  ) : (
                    <div className="py-16 text-center text-muted-foreground">
                      No designs match your search.
                    </div>
                  )}
                </section>
              </div>
            </div>
          }
        />
        <Route path="/designs/:slug" element={<DesignDetail />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
