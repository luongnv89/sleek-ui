import { Outlet, Link } from 'react-router-dom'
import { Header } from '@/components/ui/header'

export function Layout() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t bg-background py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p className="text-sm">sleek-ui — design systems that AI agents can actually use.</p>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 mt-4 text-sm">
            <Link to="/" className="hover:text-foreground transition-colors">Catalog</Link>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
            <a href="https://github.com/luongnv89/sleek-ui" className="hover:text-foreground transition-colors" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="/sleek-ui/logo/brand-showcase.html" className="hover:text-foreground transition-colors">Brand</a>
          </div>
          <p className="mt-4 text-[10px] opacity-60">Free • Open source • 60+ designs</p>
        </div>
      </footer>
    </div>
  )
}
