import { HashRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { CopyButton } from '@/components/ui/CopyButton';
import { SearchBar } from '@/components/ui/SearchBar';
import { CategoryFilter } from '@/components/ui/CategoryFilter';

function App() {
  const [searchValue, setSearchValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    { id: 'saas', label: 'SaaS', count: 42 },
    { id: 'landing', label: 'Landing', count: 28 },
    { id: 'portfolio', label: 'Portfolio', count: 15 },
    { id: 'ecommerce', label: 'E-commerce', count: 31 },
  ];

  const exampleText = 'https://luongnv89.github.io/sleek-ui/designs/warm-saas.json';

  return (
    <HashRouter>
      <Routes>
        <Route
          path="/"
          element={
            <div className="min-h-screen bg-background p-8">
              <div className="mx-auto max-w-4xl space-y-12">
                <section>
                  <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-6xl">
                    Sleek UI Components
                  </h1>
                  <p className="mt-4 text-xl text-muted-foreground">
                    Utility components for your design system
                  </p>
                </section>

                {/* CopyButton Demo */}
                <section className="rounded-lg border bg-card p-6 shadow-sm">
                  <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                    CopyButton
                  </h2>
                  <p className="mt-4 text-lg text-muted-foreground">
                    A button component that copies text to clipboard with visual feedback
                  </p>
                  <div className="mt-6 flex items-center gap-2 rounded-md border p-3">
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

                {/* SearchBar Demo */}
                <section className="rounded-lg border bg-card p-6 shadow-sm">
                  <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                    SearchBar
                  </h2>
                  <p className="mt-4 text-lg text-muted-foreground">
                    A search input component with icon and clear button
                  </p>
                  <div className="mt-6 max-w-md">
                    <SearchBar
                      value={searchValue}
                      onChange={setSearchValue}
                      placeholder="Search components..."
                    />
                  </div>
                </section>

                {/* CategoryFilter Demo */}
                <section className="rounded-lg border bg-card p-6 shadow-sm">
                  <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                    CategoryFilter
                  </h2>
                  <p className="mt-4 text-lg text-muted-foreground">
                    A pill-style filter component for categories with count badges
                  </p>
                  <div className="mt-6">
                    <CategoryFilter
                      categories={categories}
                      selected={selectedCategory}
                      onChange={setSelectedCategory}
                    />
                    <div className="mt-6 rounded-md bg-muted p-4">
                      <p className="text-sm">
                        Selected: {selectedCategory || 'All categories'}
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          }
        />
      </Routes>
    </HashRouter>
  );
}

export default App;
