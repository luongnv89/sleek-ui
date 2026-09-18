import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Shared class for the prompt body element itself. The caller owns the
 * <pre>/<code> so each surface keeps its own a11y attributes (role, aria-label,
 * tabIndex, break-all), while every generated prompt on the site reads the same.
 */
export const promptBodyClassName =
  'max-h-96 overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-muted/50 p-3 font-mono text-micro leading-relaxed text-foreground/90 sm:p-4 sm:text-label dark:bg-muted/30';

/**
 * Props for the prompt body element. The body is scrollable
 * (`max-h-96 overflow-auto`), and a scrollable region has to be reachable and
 * operable by keyboard (WCAG 2.1.1), so the focusable named region and its
 * focus ring are built in here instead of being re-remembered at every call
 * site. Each caller passes its own `label` — the regions must not share a name.
 */
export function promptBodyProps({ label, className }: { label: string; className?: string }) {
  return {
    role: 'region',
    'aria-label': label,
    tabIndex: 0,
    className: cn(
      promptBodyClassName,
      'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      className,
    ),
  } as const;
}

export interface PromptSurfaceProps {
  /** Mono eyebrow naming the prompt, e.g. "Agent prompt". */
  label: string;
  description?: ReactNode;
  /** Copy affordance and any other controls, pinned to the end of the header row. */
  actions?: ReactNode;
  /** Extra header content below the description — app-target pills, copy status. */
  meta?: ReactNode;
  footnote?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * One container for the repeated "here is a generated prompt, copy it" job,
 * replacing the four rival treatments this site used to ship (#196 AC4).
 */
export function PromptSurface({
  label,
  description,
  actions,
  meta,
  footnote,
  children,
  className,
}: PromptSurfaceProps) {
  return (
    <div
      data-testid="prompt-surface"
      className={cn('rounded-xl border border-border bg-card p-gutter shadow-xs sm:p-6', className)}
    >
      <div className="mb-stack flex flex-col gap-stack sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="font-mono text-eyebrow uppercase text-primary-text">{label}</p>
          {description && <p className="text-micro text-muted-foreground">{description}</p>}
          {meta}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>

      {children}

      {footnote && <p className="mt-stack text-micro text-muted-foreground">{footnote}</p>}
    </div>
  );
}
