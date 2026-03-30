import { Link } from 'react-router-dom'
import { ThemeToggle } from './theme-toggle'

interface HeaderProps {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

export function Header({ theme, onToggleTheme }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <img
            src="/logo/logo-mark.svg"
            alt="sleek-ui logo mark"
            className="h-8 w-8 text-foreground"
          />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
            sleek<span className="text-[#00FF41]">ui</span>
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-foreground hover:text-[#00FF41] transition-colors">
            Catalog
          </Link>
          <a href="https://github.com/luongnv89/sleek-ui" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            GitHub
          </a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </div>
    </header>
  )
}
