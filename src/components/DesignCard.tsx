import { useState } from 'react';
import { ExternalLink, Moon, Sun } from 'lucide-react';
import { cn } from '../lib/utils';
import { TransformedDesign } from '../types/design';
import { CopyButton } from './CopyButton';

interface DesignCardProps {
  design: TransformedDesign;
  onClick?: (design: TransformedDesign) => void;
  className?: string;
}

interface ColorSwatchProps {
  name: string;
  value: string;
  label?: string;
}

function ColorSwatch({ name, value, label }: ColorSwatchProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label || name}</span>
        <CopyButton value={value} />
      </div>
      <div
        className="h-8 w-full rounded-md border border-border shadow-sm"
        style={{ backgroundColor: `hsl(${value})` }}
        aria-label={`Color swatch for ${label || name}`}
        role="img"
      />
      <div className="text-xs font-mono text-muted-foreground">{value}</div>
    </div>
  );
}

export function DesignCard({ design, onClick, className }: DesignCardProps) {
  const [mode, setMode] = useState<'light' | 'dark'>(design.defaultMode);

  const primaryColor = design.colors.primary;
  const secondaryColor = design.colors.secondary;

  const handleCardClick = () => {
    onClick?.(design);
  };

  const toggleMode = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        className
      )}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-label={`View ${design.name} design`}
    >
      {/* Preview Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        <img
          src={design.thumbnailUrl}
          alt={`${design.name} preview`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <button
          type="button"
          onClick={toggleMode}
          className="absolute right-2 top-2 rounded-md bg-background/80 p-1.5 text-foreground backdrop-blur-sm transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode preview`}
        >
          {mode === 'light' ? (
            <Moon className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Sun className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-5">
        {/* Header */}
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-foreground">{design.name}</h3>
            <div className="mt-1 flex flex-wrap gap-1">
              {design.categories.map((category) => (
                <span
                  key={category}
                  className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
          <a
            href={design.jsonUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label={`View JSON for ${design.name}`}
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>

        {/* Color Swatches */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <ColorSwatch
            name="primary"
            value={primaryColor}
            label="Primary"
          />
          <ColorSwatch
            name="secondary"
            value={secondaryColor}
            label="Secondary"
          />
        </div>

        {/* Footer Actions */}
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <span className="text-xs text-muted-foreground">
            {design.description.slice(0, 80)}...
          </span>
          <button
            type="button"
            onClick={handleCardClick}
            className="text-sm font-medium text-primary hover:text-primary/80"
          >
            Details &rarr;
          </button>
        </div>
      </div>
    </article>
  );
}
