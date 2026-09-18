import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/Button';
import { ThemePairTriad } from '@/components/ui/ThemePairTriad';
import { useDesignCatalog } from '@/hooks/useDesignCatalog';

/** Stable section id — in-page navigation is scrollIntoView, never #hrefs (#104/#147). */
export const PAIRED_THEMING_SECTION_ID = 'theme-pairing';

export function PairedThemingSection() {
  const { designs } = useDesignCatalog();

  const webExample = designs.find(design => (design.collection ?? 'web') === 'web') ?? null;
  const terminalExample =
    designs.find(design => design.collection === 'terminal' || design.collection === 'coding') ??
    null;

  return (
    <section
      id={PAIRED_THEMING_SECTION_ID}
      aria-labelledby="theme-pairing-heading"
      className="border-t border-border/60 bg-muted/30 px-gutter py-band sm:py-band-lg"
    >
      <div className="mx-auto max-w-page">
        <div className="mx-auto max-w-narrow text-center">
          <p className="font-mono text-eyebrow uppercase text-primary">Theme pairing</p>
          <h2
            id="theme-pairing-heading"
            className="mt-stack text-headline font-extrabold text-foreground sm:text-display"
          >
            One web theme, one terminal theme, one coding theme
          </h2>
          <p className="mt-stack text-lede text-muted-foreground">
            Pick a web design and sleek-ui maps it to a coding/terminal theme. A backup terminal
            theme fills in every value the website design never defines — so your editor and your
            app end up the same colour, not two guesses.
          </p>
        </div>

        <ThemePairTriad
          className="mt-flow"
          web={{
            label: 'Web theme',
            title: webExample ? webExample.name : 'Any of the web designs',
            description: 'From the catalog. Its colours, fonts and radius win every conflict.',
            swatches: webExample
              ? [`hsl(${webExample.colors.primary})`, `hsl(${webExample.colors.secondary})`]
              : undefined,
          }}
          backup={{
            label: 'Backup terminal theme',
            title: terminalExample ? terminalExample.name : 'Any terminal or coding theme',
            description:
              'Fills the syntax, ANSI and editor-chrome values a website design has no opinion about.',
          }}
          result={{
            label: 'Mapped coding theme',
            title: 'One agent prompt, both targets',
            description:
              'Every clash between the two is flagged for you to resolve before the prompt unlocks.',
          }}
        />

        <div className="mt-flow flex flex-col items-center gap-stack">
          {webExample ? (
            <Link
              to={webExample.detailUrl}
              className={cn(buttonVariants({ size: 'lg' }), 'min-h-[44px]')}
            >
              Pair {webExample.name} with a coding theme
            </Link>
          ) : (
            <Button
              type="button"
              size="lg"
              className="min-h-[44px]"
              onClick={() =>
                document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              Browse web themes to pair
            </Button>
          )}
          <p className="text-micro text-muted-foreground">
            Open any web design, choose a backup theme, resolve the conflicts, copy one prompt.
          </p>
        </div>
      </div>
    </section>
  );
}
