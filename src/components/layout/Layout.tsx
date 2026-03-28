import { Outlet, Link } from 'react-router-dom'
import { Header } from '@/components/ui/header'

interface LayoutProps {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

export function Layout({ theme, onToggleTheme }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Header theme={theme} onToggleTheme={onToggleTheme} />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t bg-background py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p className="text-sm">© 2024 sleek-ui. Design systems for AI agents.</p>
          <div className="flex justify-center gap-4 mt-4">
            <Link to="/" className="hover:text-foreground transition-colors">
              Catalog
            </Link>
            <a href="https://github.com/luongnv89/sleek-ui" className="hover:text-foreground transition-colors">
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
