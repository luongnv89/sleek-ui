import { useState } from 'react';
import { CopyButton } from '@/components/ui/CopyButton';
import { getRandomPrompt } from '@/lib/randomPrompt';

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

export function PlanSection() {
  // Lazy initializer keeps randomness out of module scope so tests stay deterministic.
  const [promptExample] = useState(() => getRandomPrompt());

  return (
    <section id="how-it-works" className="border-t border-border/60 bg-muted/30 px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Your plan</h2>
          <p className="mt-2 text-muted-foreground max-w-md mx-auto">Three actions. Your agent does the heavy lifting.</p>
        </div>

        <div className="grid gap-5 sm:gap-6 sm:grid-cols-3">
          {AGENT_STEPS.map(step => (
            <div key={step.number} className="relative rounded-xl border border-border bg-background p-6 shadow-xs flex flex-col">
              <div className="mb-4 flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-brand">{step.number}</span>
                <div className="text-muted-foreground">{step.icon}</div>
              </div>
              <h3 className="font-semibold text-base">{step.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground flex-1">{step.description}</p>
            </div>
          ))}
        </div>

        {/* Prompt example */}
        <div className="mt-8 sm:mt-10 rounded-xl border border-border bg-background p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
            <p className="text-sm font-medium text-muted-foreground">Copy this prompt. Paste into Claude, Cursor, or any agent.</p>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground/70">One click</span>
          </div>
          <div className="flex items-start gap-3 rounded-lg bg-muted/60 p-3 sm:p-4">
            <code className="flex-1 whitespace-pre-wrap break-all font-mono text-xs sm:text-sm text-foreground leading-snug">{promptExample}</code>
            <CopyButton
              text={promptExample}
              onCopy={() => {}}
              className="shrink-0 mt-0.5"
            />
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">The agent fetches the JSON and applies tokens, fonts, radius, and component classes automatically.</p>
        </div>
      </div>
    </section>
  );
}
