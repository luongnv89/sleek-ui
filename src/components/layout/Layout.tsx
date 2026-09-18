import { GithubIcon } from '@/components/ui/GithubIcon';
import { Outlet, Link } from 'react-router-dom'
import { Header } from '@/components/ui/Header'
import { buttonVariants } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { useDesignCatalog } from '@/hooks/useDesignCatalog'

/** In-page navigation is scrollIntoView, never `<a href="#…">` (#104/#147). */
const FOOTER_SECTIONS = [
  { id: 'theme-pairing', label: 'Theme pairing' },
  { id: 'copy-site', label: 'Copy a site' },
  { id: 'how-it-works', label: 'How it works' },
] as const

export function Layout() {
  const { designs, loading } = useDesignCatalog()
  const designCount = loading ? null : designs.length
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t bg-background py-band">
        <div className="container mx-auto px-gutter text-center">
          <p className="mx-auto max-w-lg text-title font-semibold leading-relaxed text-foreground">
            &ldquo;Your app shouldn&rsquo;t look like it was built in a weekend. <span className="text-muted-foreground">(Even if it was.)</span>&rdquo;
          </p>
          <div className="mt-flow">
            <a
              href="https://github.com/luongnv89/sleek-ui"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants(), 'min-h-[44px] gap-1.5')}
            >
              <GithubIcon className="h-4 w-4" />
              Star on GitHub
            </a>
          </div>
          <nav className="mt-flow flex flex-wrap justify-center gap-x-5 gap-y-1 text-label text-muted-foreground">
            <Link to="/" className="transition-colors hover:text-foreground">Catalog</Link>
            {FOOTER_SECTIONS.map(section => (
              <button
                key={section.id}
                type="button"
                onClick={() => document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' })}
                className="transition-colors hover:text-foreground"
              >
                {section.label}
              </button>
            ))}
            <a href="https://github.com/luongnv89/sleek-ui" className="transition-colors hover:text-foreground" target="_blank" rel="noopener noreferrer">GitHub</a>
            {/* Static page outside the SPA — open in a new tab so the SPA route is preserved (#141) */}
            <a href="/sleek-ui/logo/brand-showcase.html" className="hover:text-foreground transition-colors" target="_blank" rel="noopener noreferrer">Brand</a>
          </nav>
          <p className="mt-flow text-micro text-muted-foreground opacity-60">
            Free • Open source • {designCount !== null ? `${designCount}+ ${designCount === 1 ? 'design' : 'designs'}` : 'designs'}
          </p>
        </div>
      </footer>
    </div>
  )
}
