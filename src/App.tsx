import { useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import designs from './data/designs';
import { DesignCard } from './components/DesignCard';
import { TokenTable } from './components/TokenTable';
import { TransformedDesign } from './types/design';

// Import design data for TokenTable demo
import warmSaas from '../public/designs/warm-saas.json';

function App() {
  const [selectedDesign, setSelectedDesign] = useState<TransformedDesign | null>(null);

  return (
    <HashRouter>
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <header className="mb-12 text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">Sleek UI Catalog</h1>
            <p className="mt-4 text-xl text-muted-foreground">
              A collection of pre-designed UI design systems
            </p>
          </header>

          <Routes>
            <Route
              path="/"
              element={
                <>
                  {/* Design Cards Grid */}
                  <section className="mb-16">
                    <div className="mb-6 flex items-center justify-between">
                      <h2 className="text-2xl font-semibold">Design Systems</h2>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {designs.map((design) => (
                        <DesignCard
                          key={design.slug}
                          design={design}
                          onClick={setSelectedDesign}
                        />
                      ))}
                    </div>
                  </section>

                  {/* TokenTable Demo */}
                  <section className="mb-16 rounded-xl border border-border bg-card p-6">
                    <h2 className="mb-6 text-2xl font-semibold">Token Table Demo</h2>
                    <TokenTable tokens={warmSaas.tokens} />
                  </section>

                  {/* Selected Design Modal (Demo) */}
                  {selectedDesign && (
                    <div
                      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
                      onClick={() => setSelectedDesign(null)}
                    >
                      <div
                        className="w-full max-w-2xl rounded-xl border border-border bg-card p-6 shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-between">
                          <h2 className="text-2xl font-bold">{selectedDesign.name}</h2>
                          <button
                            type="button"
                            onClick={() => setSelectedDesign(null)}
                            className="rounded-md p-2 hover:bg-accent"
                            aria-label="Close modal"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </div>
                        <div className="mt-4 space-y-4">
                          <div>
                            <h3 className="font-medium text-muted-foreground">Description</h3>
                            <p className="mt-1 text-sm">{selectedDesign.description}</p>
                          </div>
                          <div>
                            <h3 className="font-medium text-muted-foreground">Categories</h3>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {selectedDesign.categories.map((cat) => (
                                <span
                                  key={cat}
                                  className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium"
                                >
                                  {cat}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h3 className="font-medium text-muted-foreground">JSON Source</h3>
                            <a
                              href={selectedDesign.jsonUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {selectedDesign.jsonUrl}
                            </a>
                          </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                          <button
                            type="button"
                            onClick={() => setSelectedDesign(null)}
                            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              }
            />
          </Routes>
        </div>
      </div>
    </HashRouter>
  );
}

export default App;
