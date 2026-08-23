import { GithubIcon } from '@/components/ui/GithubIcon';
import { useDesignCatalog } from '@/hooks/useDesignCatalog';
import { useGithubStats } from '@/hooks/useGithubStats';

// Last-known values shown while loading or when the GitHub API is
// unavailable/rate-limited (#179)
const FALLBACK_STATS = { stars: 126, forks: 11 };

export function SocialProofSection() {
  // Design-system stat is derived from the catalog, not hardcoded (#141)
  const { designs, loading } = useDesignCatalog();
  const designCount = loading ? null : designs.length;
  const { stats } = useGithubStats();
  const stars = stats?.stars ?? FALLBACK_STATS.stars;
  const forks = stats?.forks ?? FALLBACK_STATS.forks;
  return (
    <section className="border-t border-border/60 bg-background px-4 py-10 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="rounded-xl border border-border/60 bg-muted/10 p-5">
            <div className="text-2xl font-bold text-brand tabular-nums" title="Live from the GitHub API">~{stars}</div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">GitHub Stars</div>
          </div>
          <div className="rounded-xl border border-border/60 bg-muted/10 p-5">
            <div className="text-2xl font-bold text-brand tabular-nums" title="Live from the GitHub API">~{forks}</div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">Forks</div>
          </div>
          <div className="rounded-xl border border-border/60 bg-muted/10 p-5">
            <div className="text-2xl font-bold text-brand tabular-nums">{designCount ?? '—'}</div>
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
            <GithubIcon className="h-3.5 w-3.5" />
            Star on GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
