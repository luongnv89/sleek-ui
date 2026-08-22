import { GithubIcon } from '@/components/ui/GithubIcon';
import { Outlet, Link } from 'react-router-dom'
import { Header } from '@/components/ui/Header'
import { useDesignCatalog } from '@/hooks/useDesignCatalog'

export function Layout() {
  const { designs, loading } = useDesignCatalog()
  const designCount = loading ? null : designs.length
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t bg-background py-10">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg font-semibold text-foreground max-w-lg mx-auto leading-relaxed">
            &ldquo;Your app shouldn&rsquo;t look like it was built in a weekend. <span className="text-muted-foreground">(Even if it was.)</span>&rdquo;
          </p>
          <div className="mt-5">
            <a
              href="https://github.com/luongnv89/sleek-ui"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-black hover:bg-brand-hover transition-colors"
            >
              <GithubIcon className="h-4 w-4" />
              Star on GitHub
            </a>
          </div>
          <nav className="flex flex-wrap justify-center gap-x-5 gap-y-1 mt-6 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Catalog</Link>
            <button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-foreground transition-colors">How it works</button>
            <a href="https://github.com/luongnv89/sleek-ui" className="hover:text-foreground transition-colors" target="_blank" rel="noopener noreferrer">GitHub</a>
            {/* Static page outside the SPA — open in a new tab so the SPA route is preserved (#141) */}
            <a href="/sleek-ui/logo/brand-showcase.html" className="hover:text-foreground transition-colors" target="_blank" rel="noopener noreferrer">Brand</a>
          </nav>
          <p className="mt-6 text-[10px] opacity-60 text-muted-foreground">
            Free • Open source • {designCount !== null ? `${designCount}+ ${designCount === 1 ? 'design' : 'designs'}` : 'designs'}
          </p>
        </div>
      </footer>
    </div>
  )
}
