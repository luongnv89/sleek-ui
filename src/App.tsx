import { HashRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import { DesignProvider } from '@/context/DesignContext';
import { Layout } from '@/components/layout/Layout';
import { LogoMark } from '@/components/ui/LogoMark';
import { CopyButton } from '@/components/ui/CopyButton';
import { SearchBar } from '@/components/ui/SearchBar';
import { CategoryFilter } from '@/components/ui/CategoryFilter';
import { DesignDetail } from '@/components/DesignDetail';
import { DesignCard } from '@/components/catalog/DesignCard';
import { AppliedDesignBanner } from '@/components/AppliedDesignBanner';
import { ScrollToTop } from '@/components/ScrollToTop';
import designs from '@/data/designs';

const AGENT_PROMPT_TEMPLATE = (designUrl: string) => `Fetch the design system at: ${designUrl}

Read the JSON, then follow the steps in agentInstructions.steps to apply this design system to my project:

1. Set CSS custom properties from tokens.colors on :root (light) and .dark (dark mode)
2. Set --radius from tokens.radius.default
3. Load fonts by adding the Google Fonts URL from fonts.urls as a <link> tag
4. Set font-family from tokens.typography.fontFamily
5. Apply component styles from the components field (Tailwind class names for shadcn projects)
6. Ensure focus states match accessibility.focusRing specification
7. Test both light and dark modes

Target framework: Tailwind CSS + shadcn/ui. For other frameworks, map token names to CSS custom properties semantically.`;

const AGENT_STEPS = [
  {
    number: '01',
    title: 'Pick your design',
    description: 'Browse 60+ systems. Match the vibe you want — clean, bold, minimal, or branded.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Copy the prompt',
    description: 'One click gets the exact URL and instructions. Ready for any coding agent. No accounts.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Let your agent apply it',
    description: 'Paste once. The agent reads the tokens, loads fonts, and restyles your app.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
  },
];

const AGENTS = ['Claude Code', 'Cursor', 'Codex CLI', 'Windsurf', 'Copilot', 'Gemini CLI'];

function getRandomPrompt() {
  const pick = designs[Math.floor(Math.random() * designs.length)];
  return AGENT_PROMPT_TEMPLATE(pick.jsonUrl);
}

const PROMPT_EXAMPLE = getRandomPrompt();

function HomePageInner() {
  const [searchValue, setSearchValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Object.entries(
    designs.flatMap(d => d.categories).reduce((acc, cat) => {
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([id, count]) => ({ id, label: id, count }));

  const filteredDesigns = designs.filter(d => {
    const matchesSearch = !searchValue || d.name.toLowerCase().includes(searchValue.toLowerCase());
    const matchesCategory = !selectedCategory || d.categories.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* ── HERO ── */}
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

      {/* ── PAIN (moved before video per #83) ── */}
      <section className="border-t border-border/60 px-4 py-12 sm:py-14 bg-background">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-xl border border-border/60 bg-muted/10 p-6 text-muted-foreground/90">
            <div className="text-xs tracking-[2px] font-mono mb-2 opacity-70">THE ALTERNATIVE</div>
            <h3 className="font-semibold mb-3 text-foreground/80">What most AI-built apps look like</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2"><span className="mt-1">•</span> <span>Default browser styles or random Tailwind values.</span></li>
              <li className="flex gap-2"><span className="mt-1">•</span> <span>Mismatched buttons, inputs, and cards that scream &ldquo;vibe coded&rdquo;.</span></li>
              <li className="flex gap-2"><span className="mt-1">•</span> <span>Users trust polished interfaces more than raw functionality.</span></li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF (#79) ── */}
      <section className="border-t border-border/60 bg-background px-4 py-10 sm:py-12">
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="rounded-xl border border-border/60 bg-muted/10 p-5">
              <div className="text-2xl font-bold text-[#00FF41] tabular-nums">126</div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">GitHub Stars</div>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/10 p-5">
              <div className="text-2xl font-bold text-[#00FF41] tabular-nums">11</div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">Forks</div>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/10 p-5">
              <div className="text-2xl font-bold text-[#00FF41] tabular-nums">60+</div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">Design Systems</div>
            </div>
          </div>
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              &ldquo;This is free and it&rsquo;s one URL &mdash; vs. a $299 UI kit, vs. hiring a designer, vs. hand-picking Tailwind colors.&rdquo;
            </p>
            <a
              href="https://github.com/luongnv89/sleek-ui"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              Star on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* ── VIDEO ── */}
      <section className="border-t border-border/60 px-4 py-14 sm:py-16 bg-muted/20">
        <div className="mx-auto max-w-4xl text-center space-y-5">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Watch it transform a real app</h2>
            <p className="mt-2 text-muted-foreground">One URL. One prompt. The agent rewrites the entire interface.</p>
          </div>
          <div className="rounded-xl overflow-hidden border border-border shadow-lg">
            <video
              src="/sleek-ui/promotional-video.mp4"
              controls
              autoPlay
              muted
              loop
              playsInline
              className="w-full aspect-video"
            />
          </div>
        </div>
      </section>

      {/* ── PLAN (StoryBrand) ── */}
      <section id="how-it-works" className="border-t border-border/60 bg-muted/30 px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Your plan</h2>
            <p className="mt-2 text-muted-foreground max-w-md mx-auto">Three actions. Your agent does the heavy lifting.</p>
          </div>

          <div className="grid gap-5 sm:gap-6 sm:grid-cols-3">
            {AGENT_STEPS.map(step => (
              <div key={step.number} className="relative rounded-xl border border-border bg-background p-6 shadow-sm flex flex-col">
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-[#00FF41]">{step.number}</span>
                  <div className="text-muted-foreground">{step.icon}</div>
                </div>
                <h3 className="font-semibold text-base">{step.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground flex-1">{step.description}</p>
              </div>
            ))}
          </div>

          {/* Prompt example */}
          <div className="mt-8 sm:mt-10 rounded-xl border border-border bg-background p-5 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
              <p className="text-sm font-medium text-muted-foreground">Copy this prompt. Paste into Claude, Cursor, or any agent.</p>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground/70">One click</span>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-muted/60 p-3 sm:p-4">
              <code className="flex-1 whitespace-pre-wrap break-all font-mono text-xs sm:text-sm text-foreground leading-snug">{PROMPT_EXAMPLE}</code>
              <CopyButton
                text={PROMPT_EXAMPLE}
                onCopy={() => {}}
                className="shrink-0 mt-0.5"
              />
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">The agent fetches the JSON and applies tokens, fonts, radius, and component classes automatically.</p>
          </div>
        </div>
      </section>

      {/* ── CATALOG ── */}
      <section id="catalog" className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Choose your system</h2>
              <p className="mt-1.5 text-muted-foreground">
                Every design includes light + dark tokens, typography, and agent instructions. Start here.
              </p>
            </div>
            <span className="text-sm text-muted-foreground tabular-nums">
              {filteredDesigns.length} / {designs.length} designs
            </span>
          </div>

          <SearchBar
            value={searchValue}
            onChange={setSearchValue}
            placeholder="Search by name, brand, or style..."
          />

          <CategoryFilter
            categories={categories}
            selected={selectedCategory}
            onChange={setSelectedCategory}
          />

          {filteredDesigns.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredDesigns.map((design) => (
                <DesignCard key={design.slug} design={design} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-20 text-center text-muted-foreground gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p>No designs match your search.</p>
              <button
                onClick={() => { setSearchValue(''); setSelectedCategory(null); }}
                className="text-sm text-[#00FF41] hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── FOUNDER (#82) ── */}
      <section className="border-t border-border/60 bg-muted/20 px-4 py-12 sm:py-14">
        <div className="mx-auto max-w-lg text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted border border-border/60 overflow-hidden mb-4">
            <span className="text-2xl font-bold text-[#00FF41]">L</span>
          </div>
          <h3 className="font-semibold text-foreground">Built solo by Luong</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
            &ldquo;I got tired of AI-built apps looking like AI built them. sleek-ui is the cure. PRs welcome.&rdquo;
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <a
              href="https://github.com/luongnv89"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              @luongnv89
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <DesignProvider>
        <HashRouter>
          <ScrollToTop />
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePageInner />} />
              <Route path="/designs/:slug" element={<DesignDetail />} />
            </Route>
          </Routes>
          <AppliedDesignBanner />
        </HashRouter>
      </DesignProvider>
    </ThemeProvider>
  );
}

export default App;
