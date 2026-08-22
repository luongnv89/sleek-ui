export function PainSection() {
  return (
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
  );
}
