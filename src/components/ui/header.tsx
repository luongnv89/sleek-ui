import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { ThemeToggle } from './theme-toggle'
import { LogoMark } from './LogoMark'
import { useTheme } from '@/context/ThemeContext'

export function Header() {
  const { theme, toggleTheme } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const closeMenu = () => setIsMenuOpen(false)

  const navLinkClass = "text-sm font-medium text-foreground hover:text-[#00FF41] transition-colors"
  const navLinkMutedClass = "text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight" onClick={closeMenu}>
          <LogoMark className="h-8 w-8 text-foreground" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
            sleek<span className="text-[#00FF41]">ui</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className={navLinkClass}>
            Catalog
          </Link>
          <a href="#how-it-works" className={navLinkMutedClass}>
            How it works
          </a>
          <a href="https://github.com/luongnv89/sleek-ui" target="_blank" rel="noopener noreferrer" className={navLinkMutedClass}>
            GitHub
          </a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur">
          <nav className="container mx-auto flex flex-col px-4 py-4 gap-1">
            <Link
              to="/"
              className="block py-2.5 text-sm font-medium text-foreground hover:text-[#00FF41]"
              onClick={closeMenu}
            >
              Catalog
            </Link>
            <a
              href="#how-it-works"
              className="block py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground"
              onClick={closeMenu}
            >
              How it works
            </a>
            <a
              href="https://github.com/luongnv89/sleek-ui"
              target="_blank"
              rel="noopener noreferrer"
              className="block py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground"
              onClick={closeMenu}
            >
              GitHub
            </a>
            <div className="pt-2 mt-1 border-t">
              <a
                href="#catalog"
                className="inline-flex w-full items-center justify-center rounded-md bg-[#00FF41] px-4 py-2 text-sm font-semibold text-black hover:bg-[#00e639] transition-colors"
                onClick={closeMenu}
              >
                Browse Designs
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
