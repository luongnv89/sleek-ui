import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * One labelled part of the pairing flow. Purely data — this component holds no
 * state and runs no mapping logic, so the landing section and the design-detail
 * panel render the identical flow without duplicating #188's conflict handling.
 */
export interface ThemePairPart {
  /** Role label for the part, e.g. "Backup terminal theme". */
  label: string;
  /** When set, the role label is rendered as the <label> for this control id. */
  labelFor?: string;
  /** Name of the concrete theme, or a plain-language placeholder. */
  title?: string;
  description?: string;
  /** Decorative swatch row — CSS color strings, already formatted by the caller. */
  swatches?: string[];
  /** Control that belongs to this part, e.g. the backup-theme <select>. */
  control?: ReactNode;
}

export interface ThemePairTriadProps {
  web: ThemePairPart;
  backup: ThemePairPart;
  result: ThemePairPart;
  className?: string;
}

const connectorClass =
  'flex items-center justify-center font-mono text-title font-semibold text-muted-foreground/70 select-none';

function Part({ part, emphasis = false }: { part: ThemePairPart; emphasis?: boolean }) {
  const labelClass = cn(
    'font-mono text-eyebrow uppercase',
    emphasis ? 'text-primary' : 'text-muted-foreground',
  );

  return (
    <div
      className={cn(
        'flex min-w-0 flex-col gap-stack rounded-lg border p-gutter transition-colors',
        emphasis
          ? 'border-primary/40 bg-primary/5 dark:border-primary/50 dark:bg-primary/10'
          : 'border-border bg-card',
      )}
    >
      {part.labelFor ? (
        <label htmlFor={part.labelFor} className={labelClass}>
          {part.label}
        </label>
      ) : (
        <p className={labelClass}>{part.label}</p>
      )}

      {part.title && (
        <p className="break-words text-label font-semibold text-foreground">{part.title}</p>
      )}

      {part.swatches && part.swatches.length > 0 && (
        <div aria-hidden="true" className="flex flex-wrap gap-1">
          {part.swatches.map((color, index) => (
            <span
              key={`${color}-${index}`}
              className="h-3.5 w-3.5 rounded-full border border-border/70"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      )}

      {part.description && <p className="text-micro text-muted-foreground">{part.description}</p>}

      {part.control}
    </div>
  );
}

/**
 * The three-part pairing flow — web theme + backup terminal theme = mapped
 * coding theme — rendered as one visibly labelled sequence (#196 AC1).
 */
export function ThemePairTriad({ web, backup, result, className }: ThemePairTriadProps) {
  return (
    <div
      data-testid="theme-pair-triad"
      className={cn(
        'grid gap-grid md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)]',
        className,
      )}
    >
      <Part part={web} />
      <span aria-hidden="true" className={connectorClass}>
        +
      </span>
      <Part part={backup} />
      <span aria-hidden="true" className={connectorClass}>
        =
      </span>
      <Part part={result} emphasis />
    </div>
  );
}
