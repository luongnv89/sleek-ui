import { LogoMark } from '@/components/ui/LogoMark';
import designs from '@/data/designs';

const AGENTS = ['Claude Code', 'Cursor', 'Codex CLI', 'Windsurf', 'Copilot', 'Gemini CLI'];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 py-16 sm:py-24 text-center">
      {/* Subtle grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      {/* Glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-72 w-72 rounded-full bg-[#00FF41]/10 blur-3xl" />

      <div className="relative mx-auto max-w-4xl space-y-6 sm:space-y-8">
        <div className="flex justify-center">
          <LogoMark className="h-14 w-14 sm:h-16 sm:w-16 text-foreground" />
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Give your AI agent{' '}
            <span className="text-[#00FF41]">good taste</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
            <strong className="text-foreground">{designs.length}+ production-grade design systems</strong>, one URL, zero Figma.
          </p>
        </div>

        {/* Agent badges */}
        <div className="flex flex-wrap justify-center gap-2">
          {AGENTS.map(agent => (
            <span
              key={agent}
              className="rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground"
            >
              {agent}
            </span>
          ))}
        </div>

        <div className="flex flex-col items-center gap-2 pt-2">
          <button
            onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex items-center justify-center rounded-md bg-[#00FF41] px-6 py-3 text-sm font-semibold text-black shadow hover:bg-[#00e639] active:bg-[#00cc33] transition-colors"
          >
            Browse {designs.length} Designs
          </button>
          <button
            onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            See how it works ↓
          </button>
        </div>

        <p className="text-xs text-muted-foreground">Free. Open source. Works in any Tailwind project.</p>
      </div>
    </section>
  );
}
