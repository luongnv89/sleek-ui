import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LogoMark } from '@/components/ui/LogoMark';
import { useDesignCatalog } from '@/hooks/useDesignCatalog';

const AGENTS = ['Claude Code', 'Cursor', 'Codex CLI', 'Windsurf', 'Copilot', 'Gemini CLI'];

const scrollToSection = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

export function HeroSection() {
  const { designs, loading } = useDesignCatalog();
  const count = loading ? null : designs.length;
  return (
    <section className="relative overflow-hidden px-gutter py-band text-center sm:py-band-lg">
      {/* Subtle grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      {/* Glow — the accent token, so it travels with an applied design. */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative mx-auto max-w-page space-y-flow">
        <div className="flex justify-center">
          <LogoMark className="h-14 w-14 text-foreground sm:h-16 sm:w-16" />
        </div>

        <div className="mx-auto max-w-narrow space-y-stack">
          <p className="font-mono text-eyebrow uppercase text-muted-foreground">
            Design systems for coding agents
          </p>
          <h1 className="text-display font-extrabold text-foreground sm:text-hero">
            Give your AI agent{' '}
            <span className="relative whitespace-nowrap">
              good taste
              {/* Accent underline, not the fixed brand green — it re-themes with an applied design. */}
              <span
                aria-hidden="true"
                className="absolute inset-x-0 -bottom-1 h-[0.14em] rounded-full bg-primary/70"
              />
            </span>
          </h1>
          <p className="text-lede text-muted-foreground">
            <strong className="font-semibold text-foreground">
              {count !== null ? `${count}+ production-grade design systems` : 'Production-grade design systems'}
            </strong>
            {' — one URL, zero Figma.'}
          </p>
          <p className="text-body text-muted-foreground">
            Pair a web theme with a matching coding theme and a backup terminal theme, or paste any
            URL to copy that site&rsquo;s style.
          </p>
        </div>

        {/* Agent badges */}
        <div className="flex flex-wrap justify-center gap-2">
          {AGENTS.map(agent => (
            <Badge key={agent} variant="outline" className="text-micro font-medium text-muted-foreground">
              {agent}
            </Badge>
          ))}
        </div>

        <div className="flex flex-col items-center gap-stack">
          <div className="flex w-full flex-col items-stretch justify-center gap-stack sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
            <Button type="button" size="lg" className="min-h-[44px]" onClick={() => scrollToSection('catalog')}>
              Browse {count !== null ? `${count} ` : ''}Design{count === 1 ? '' : 's'}
            </Button>
            <Button
              type="button"
              size="lg"
              variant="outline"
              className="min-h-[44px]"
              onClick={() => scrollToSection('theme-pairing')}
            >
              Pair a coding theme
            </Button>
            <Button
              type="button"
              size="lg"
              variant="outline"
              className="min-h-[44px]"
              onClick={() => scrollToSection('copy-site')}
            >
              Copy any site
            </Button>
          </div>
          <button
            type="button"
            onClick={() => scrollToSection('how-it-works')}
            className="min-h-[44px] text-label text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            See how it works ↓
          </button>
        </div>

        <p className="text-micro text-muted-foreground">Free. Open source. Works in any Tailwind project.</p>
      </div>
    </section>
  );
}
