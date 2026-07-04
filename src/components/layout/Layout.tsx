import { Outlet, Link } from 'react-router-dom'
import { Header } from '@/components/ui/header'

export function Layout() {
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
              className="inline-flex items-center gap-1.5 rounded-md bg-[#00FF41] px-4 py-2 text-sm font-semibold text-black hover:bg-[#00e639] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              Star on GitHub
            </a>
          </div>
          <nav className="flex flex-wrap justify-center gap-x-5 gap-y-1 mt-6 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Catalog</Link>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
            <a href="https://github.com/luongnv89/sleek-ui" className="hover:text-foreground transition-colors" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="/sleek-ui/logo/brand-showcase.html" className="hover:text-foreground transition-colors">Brand</a>
          </nav>
          <p className="mt-6 text-[10px] opacity-60 text-muted-foreground">Free • Open source • 60+ designs</p>
        </div>
      </footer>
    </div>
  )
}
