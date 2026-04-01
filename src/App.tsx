import { HashRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { LogoMark } from '@/components/ui/LogoMark';
import { CopyButton } from '@/components/ui/CopyButton';
import { SearchBar } from '@/components/ui/SearchBar';
import { CategoryFilter } from '@/components/ui/CategoryFilter';
import { DesignDetail } from '@/components/DesignDetail';
import { DesignCard } from '@/components/catalog/DesignCard';
import { AppliedDesignBanner } from '@/components/AppliedDesignBanner';
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
    title: 'Browse the catalog',
    description: 'Pick a design system that matches your brand vibe — from minimalist to bold.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Copy the prompt',
    description: 'Each design page has a ready-made prompt. One click to copy — no signup, no installs.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Tell your AI agent',
    description: 'Paste the prompt into any AI coding agent. It handles the rest.',
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

function HomePage() {
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
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <LogoMark className="h-7 w-7 text-foreground" />
            <span className="font-bold tracking-tight">
              sleek<span className="text-[#00FF41]">ui</span>
            </span>
          </div>
          <nav className="flex items-center gap-6 text-sm">
            <button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} className="text-muted-foreground hover:text-foreground transition-colors">How it works</button>
            <button onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })} className="text-muted-foreground hover:text-foreground transition-colors">Catalog</button>
            <a
              href="https://github.com/luongnv89/sleek-ui"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.92.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              GitHub
            </a>
          </nav>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden px-4 py-20 sm:py-28 text-center">
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

        <div className="relative mx-auto max-w-4xl space-y-8">
          <div className="flex justify-center">
            <LogoMark className="h-16 w-16 text-foreground" />
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-7xl">
              The Unsplash of Design Systems{' '}
              <span className="text-[#00FF41]">for AI Agents</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Paste a URL. Get a professional UI. <strong className="text-foreground">{designs.length}+ curated design systems</strong> ready for any AI coding agent — no setup required.
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

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center justify-center rounded-md bg-[#00FF41] px-6 py-3 text-sm font-semibold text-black shadow hover:bg-[#00e639] transition-colors"
            >
              Browse {designs.length} Designs
            </button>
            <button
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center justify-center rounded-md border border-border px-6 py-3 text-sm font-medium hover:bg-muted transition-colors"
            >
              How it works
            </button>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="border-t border-border/60 bg-muted/30 px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Three steps to a beautiful UI</h2>
            <p className="mt-3 text-muted-foreground">No npm installs. No config files. Just a prompt.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {AGENT_STEPS.map(step => (
              <div key={step.number} className="relative rounded-xl border border-border bg-background p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-[#00FF41]">{step.number}</span>
                  <div className="text-muted-foreground">{step.icon}</div>
                </div>
                <h3 className="font-semibold text-base">{step.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>

          {/* Prompt example */}
          <div className="mt-10 rounded-xl border border-border bg-background p-6 shadow-sm">
            <p className="mb-3 text-sm font-medium text-muted-foreground">Example prompt — paste into any AI agent:</p>
            <div className="flex items-start gap-3 rounded-lg bg-muted/60 p-4">
              <code className="flex-1 whitespace-pre-wrap break-all font-mono text-sm text-foreground">{PROMPT_EXAMPLE}</code>
              <CopyButton
                text={PROMPT_EXAMPLE}
                onCopy={() => {}}
                className="shrink-0 mt-0.5"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── CATALOG ── */}
      <section id="catalog" className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Design Catalog</h2>
              <p className="mt-1.5 text-muted-foreground">
                Inspired by the world's best brands. Ready for your project.
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

      {/* ── FOOTER ── */}
      <footer className="border-t border-border/60 px-4 py-10">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <LogoMark className="h-5 w-5 text-foreground" />
            <span className="font-semibold text-foreground">sleek<span className="text-[#00FF41]">ui</span></span>
            <span className="ml-2">MIT Licensed</span>
          </div>
          <div className="flex items-center gap-5">
            <a href="https://github.com/luongnv89/sleek-ui" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">GitHub</a>
            <a href="/sleek-ui/logo/brand-showcase.html" className="hover:text-foreground transition-colors">Brand Showcase</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/designs/:slug" element={<DesignDetail />} />
      </Routes>
      <AppliedDesignBanner />
    </HashRouter>
  );
}

export default App;
