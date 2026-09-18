import { useEffect, useState } from 'react';
import { CopyButton } from '@/components/ui/CopyButton';
import { PromptSurface, promptBodyProps } from '@/components/ui/PromptSurface';
import { getRandomPrompt } from '@/lib/randomPrompt';

const AGENT_STEPS = [
  {
    number: '01',
    title: 'Pick your design',
    description: 'Browse 60+ web, terminal, and coding systems — or paste the URL of a site whose look you already want.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Copy the prompt',
    description: 'One click gets the exact URL and instructions. Pair a web theme with a coding theme and a backup terminal theme in the same prompt.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Let your agent apply it',
    description: 'Paste once. The agent reads the tokens, loads fonts, and restyles your app — and your editor too.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
  },
];

export function PlanSection() {
  // Async initializer keeps randomness out of module scope so tests stay deterministic.
  const [promptExample, setPromptExample] = useState('');

  useEffect(() => {
    let alive = true;
    getRandomPrompt().then(prompt => {
      if (alive) setPromptExample(prompt);
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="border-t border-border/60 bg-muted/30 px-gutter py-band sm:py-band-lg"
    >
      <div className="mx-auto max-w-page">
        <div className="mx-auto max-w-narrow text-center">
          <p className="font-mono text-eyebrow uppercase text-primary-text">How it works</p>
          <h2
            id="how-it-works-heading"
            className="mt-stack text-headline font-extrabold text-foreground sm:text-display"
          >
            Your plan
          </h2>
          <p className="mt-stack text-lede text-muted-foreground">Three actions. Your agent does the heavy lifting.</p>
        </div>

        <div className="mt-flow grid gap-grid md:grid-cols-3">
          {AGENT_STEPS.map(step => (
            <div key={step.number} className="relative flex flex-col rounded-xl border border-border bg-card p-gutter shadow-xs sm:p-6">
              <div className="mb-stack flex items-center gap-3">
                <span className="font-mono text-eyebrow font-bold text-primary-text">{step.number}</span>
                <div className="text-muted-foreground">{step.icon}</div>
              </div>
              <h3 className="text-label font-semibold text-foreground">{step.title}</h3>
              <p className="mt-1.5 flex-1 text-micro text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>

        {/* Prompt example — same surface as every other generated prompt (#196). */}
        <PromptSurface
          className="mt-flow"
          label="Example prompt"
          description="This is all your agent needs. One click, one paste."
          actions={<CopyButton text={promptExample} onCopy={() => {}} className="min-h-[44px] shrink-0" />}
          footnote="The agent fetches the JSON and applies tokens, fonts, radius, and component classes automatically."
        >
          <code {...promptBodyProps({ label: 'Example prompt', className: 'block break-all' })}>
            {promptExample}
          </code>
        </PromptSurface>
      </div>
    </section>
  );
}
