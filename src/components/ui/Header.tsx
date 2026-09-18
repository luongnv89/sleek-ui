import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { LogoMark } from './LogoMark'
import { Button } from './Button'
import { useTheme } from '@/context/ThemeContext'
import { useSectionScroll } from '@/hooks/useSectionScroll'

/**
 * In-page navigation is scrollIntoView, never `<a href="#…">` — the app runs under
 * HashRouter on the GitHub Pages base, where a hash href hijacks the route (#104/#147).
 * The ids live on the home route only, so off-route the handler routes home first
 * (see useSectionScroll).
 */
const SECTION_LINKS = [
  { id: 'theme-pairing', label: 'Theme pairing' },
  { id: 'copy-site', label: 'Copy a site' },
  { id: 'how-it-works', label: 'How it works' },
] as const

export function Header() {
  const { theme, toggleTheme } = useTheme()
  const scrollToSection = useSectionScroll()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const closeMenu = () => setIsMenuOpen(false)

  // Escape closes the menu and returns focus to the toggle; Tab is trapped
  // between the toggle button and the open menu (#139).
  useEffect(() => {
    if (!isMenuOpen) return

    const firstMenuItem = menuRef.current?.querySelector<HTMLElement>('a[href], button')
    firstMenuItem?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setIsMenuOpen(false)
        menuButtonRef.current?.focus()
        return
      }
      if (e.key === 'Tab' && menuRef.current) {
        const focusables = Array.from(
          menuRef.current.querySelectorAll<HTMLElement>('a[href], button'),
        )
        if (focusables.length === 0) return
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        const active = document.activeElement
        if (e.shiftKey && (active === first || !menuRef.current.contains(active))) {
          e.preventDefault()
          menuButtonRef.current?.focus()
        } else if (!e.shiftKey && active === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isMenuOpen])

  const navLinkClass = "text-label font-medium text-foreground transition-colors hover:text-muted-foreground"
  const navLinkMutedClass = "text-label font-medium text-muted-foreground transition-colors hover:text-foreground"

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight" onClick={closeMenu}>
          <LogoMark className="h-8 w-8 text-foreground" />
          <span className="bg-clip-text text-transparent bg-linear-to-r from-foreground to-muted-foreground">
            sleek<span className="text-brand">ui</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-4 md:flex lg:gap-6">
          <Link to="/" className={navLinkClass}>
            Catalog
          </Link>
          {SECTION_LINKS.map(section => (
            <button
              key={section.id}
              type="button"
              onClick={() => scrollToSection(section.id)}
              className={navLinkMutedClass}
            >
              {section.label}
            </button>
          ))}
          <a href="https://github.com/luongnv89/sleek-ui" target="_blank" rel="noopener noreferrer" className={navLinkMutedClass}>
            GitHub
          </a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />

          {/* Mobile Menu Button */}
          <button
            ref={menuButtonRef}
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
        <div ref={menuRef} className="md:hidden border-t bg-background/95 backdrop-blur">
          <nav className="container mx-auto flex flex-col px-4 py-4 gap-1">
            <Link
              to="/"
              className="block min-h-[44px] py-2.5 text-label font-medium text-foreground hover:text-muted-foreground"
              onClick={closeMenu}
            >
              Catalog
            </Link>
            {SECTION_LINKS.map(section => (
              <button
                key={section.id}
                type="button"
                className="block min-h-[44px] py-2.5 text-left text-label font-medium text-muted-foreground hover:text-foreground"
                onClick={() => {
                  scrollToSection(section.id)
                  closeMenu()
                }}
              >
                {section.label}
              </button>
            ))}
            <a
              href="https://github.com/luongnv89/sleek-ui"
              target="_blank"
              rel="noopener noreferrer"
              className="block min-h-[44px] py-2.5 text-label font-medium text-muted-foreground hover:text-foreground"
              onClick={closeMenu}
            >
              GitHub
            </a>
            <div className="pt-2 mt-1 border-t">
              <Button
                type="button"
                className="min-h-[44px] w-full"
                onClick={() => {
                  scrollToSection('catalog')
                  closeMenu()
                }}
              >
                Browse Designs
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
