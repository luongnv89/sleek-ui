import { GithubIcon } from '@/components/ui/GithubIcon';
export function FounderSection() {
  return (
    <section className="border-t border-border/60 bg-muted/20 px-4 py-12 sm:py-14">
      <div className="mx-auto max-w-lg text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted border border-border/60 overflow-hidden mb-4">
          <span className="text-2xl font-bold text-brand">L</span>
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
            <GithubIcon className="h-3.5 w-3.5" />
            @luongnv89
          </a>
        </div>
      </div>
    </section>
  );
}
