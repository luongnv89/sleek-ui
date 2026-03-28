import { useState } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import designs from '@/data/designs'
import { Layout } from '@/components/layout/Layout'
import { DesignCard } from '@/components/catalog/DesignCard'
import { FilterBar } from '@/components/catalog/FilterBar'

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  // Get all unique categories from designs
  const allCategories = Array.from(new Set(designs.flatMap((d) => d.categories)))

  // Filter designs based on search and category
  const filteredDesigns = designs.filter((design) => {
    const matchesSearch = design.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      design.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = activeCategory === 'all' || design.categories.includes(activeCategory)

    return matchesSearch && matchesCategory
  })

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={
          <Layout theme={theme} onToggleTheme={toggleTheme}>
            <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
              <div className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight mb-2">
                  Design Catalog
                </h1>
                <p className="text-lg text-muted-foreground">
                  A collection of pre-designed, accessible UI design systems for AI agents
                </p>
              </div>

              <FilterBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
                categories={allCategories}
              />

              {filteredDesigns.length > 0 ? (
                <div className="catalog-grid mt-8">
                  {filteredDesigns.map((design) => (
                    <DesignCard key={design.slug} design={design} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="mb-4 rounded-full bg-muted p-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-muted-foreground"
                    >
                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                      <line x1="3" x2="21" y1="9" y2="9" />
                      <line x1="9" x2="9" y1="21" y2="9" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No designs found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}
            </div>
          </Layout>
        } />
      </Routes>
    </HashRouter>
  )
}

export default App
