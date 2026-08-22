import { useState, useCallback, useEffect, useRef } from 'react';
import { Check, Copy, Moon, Sun } from 'lucide-react';
import { cn } from '../lib/utils';
import { DesignTokens } from '../types/design';

interface TokenTableProps {
  tokens: DesignTokens;
  className?: string;
  /**
   * When the parent (DesignDetail) flips its page-level light/dark preview, keep
   * the swatch preview in sync so the two toggles don't read as independent
   * controls. The local toggle button can still override afterwards.
   */
  previewDark?: boolean;
}

/**
 * Copy-to-clipboard with transient "copied" feedback that is cancelled on
 * unmount. `flag` is the value written to state while copied (a boolean for the
 * single-target pills, or `'l' | 'd'` for the two-target swatches); `reset` is
 * the value it returns to. The pending timer is tracked in a ref and cleared on
 * unmount so the timeout never fires `setState` on an unmounted component.
 */
function useCopyFeedback<T>(flag: T, reset: T) {
  const [copied, setCopied] = useState<T>(reset);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = useCallback(
    (value?: string, copiedFlag: T = flag) => {
      if (!value || !navigator.clipboard) return;
      navigator.clipboard
        .writeText(value)
        .then(() => {
          setCopied(copiedFlag);
          clearTimeout(timer.current);
          timer.current = setTimeout(() => setCopied(reset), 1500);
        })
        .catch(() => {
          /* clipboard unavailable (insecure context / denied) — fail silently */
        });
    },
    [flag, reset]
  );

  return [copied, copy] as const;
}

/**
 * Compact, copy-on-click value pill used across every token category.
 * Replaces the per-row CopyButton so a whole token (name + value) is a single
 * click target, which is what makes the dense grid scannable.
 */
function CopyPill({
  label,
  value,
  className,
  swatch,
}: {
  label?: string;
  value: string;
  className?: string;
  swatch?: React.ReactNode;
}) {
  const [copied, copy] = useCopyFeedback(true, false);

  return (
    <button
      type="button"
      onClick={() => copy(value)}
      className={cn(
        'group flex w-full items-center gap-2 rounded-md border border-border bg-card px-2 py-1.5 text-left transition-colors hover:border-ring/40 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background',
        className
      )}
      aria-label={`Copy ${label ? `${label} ` : ''}value ${value}`}
      title={copied ? 'Copied!' : `Copy "${value}"`}
    >
      {swatch}
      <span className="flex min-w-0 flex-1 flex-col leading-tight">
        {label && (
          <span className="truncate font-mono text-[11px] font-medium text-foreground">{label}</span>
        )}
        <span className="truncate font-mono text-[11px] text-muted-foreground">{value}</span>
      </span>
      {copied ? (
        <Check className="h-3.5 w-3.5 shrink-0 text-green-500" aria-hidden="true" />
      ) : (
        <Copy
          className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60 transition-colors group-hover:text-foreground"
          aria-hidden="true"
        />
      )}
    </button>
  );
}

/** A labelled group of token pills (typography, spacing, radius, shadows). */
function TokenGroup({
  title,
  children,
  cols = 'grid-cols-2 sm:grid-cols-3',
}: {
  title: string;
  children: React.ReactNode;
  cols?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</h4>
      <div className={cn('grid gap-1.5', cols)}>{children}</div>
    </div>
  );
}

/** A single color swatch cell showing the token name plus BOTH light and dark values. */
function ColorSwatch({
  name,
  lightValue,
  darkValue,
  previewDark,
}: {
  name: string;
  lightValue?: string;
  darkValue?: string;
  previewDark: boolean;
}) {
  const previewValue = (previewDark ? darkValue : lightValue) || lightValue || darkValue || '';
  const [copied, copy] = useCopyFeedback<'l' | 'd' | null>('l', null);

  return (
    <div className="flex flex-col gap-0.5 rounded-lg border border-border bg-card p-1.5">
      <div className="flex items-center gap-1.5">
        <span
          className="h-6 w-6 shrink-0 rounded-md border border-border shadow-sm"
          style={{ backgroundColor: `hsl(${previewValue})` }}
          aria-hidden="true"
        />
        <code className="truncate font-mono text-[11px] font-medium text-foreground" title={name}>
          {name}
        </code>
      </div>
      <div className="flex flex-col gap-0.5">
        {lightValue && (
          <button
            type="button"
            onClick={() => copy(lightValue, 'l')}
            className="group flex min-h-[24px] items-center justify-between gap-1 rounded px-1 py-1 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`Copy light value for ${name}: ${lightValue}`}
            title={`Copy light "${lightValue}"`}
          >
            <span className="flex min-w-0 items-center gap-1">
              <span className="text-[9px] font-semibold uppercase text-muted-foreground">L</span>
              <span className="truncate font-mono text-[10px] text-muted-foreground">{lightValue}</span>
            </span>
            {copied === 'l' ? (
              <Check className="h-3 w-3 shrink-0 text-green-500" aria-hidden="true" />
            ) : (
              <Copy className="h-3 w-3 shrink-0 text-muted-foreground/60 transition-colors group-hover:text-foreground" aria-hidden="true" />
            )}
          </button>
        )}
        {darkValue && (
          <button
            type="button"
            onClick={() => copy(darkValue, 'd')}
            className="group flex min-h-[24px] items-center justify-between gap-1 rounded px-1 py-1 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`Copy dark value for ${name}: ${darkValue}`}
            title={`Copy dark "${darkValue}"`}
          >
            <span className="flex min-w-0 items-center gap-1">
              <span className="text-[9px] font-semibold uppercase text-muted-foreground">D</span>
              <span className="truncate font-mono text-[10px] text-muted-foreground">{darkValue}</span>
            </span>
            {copied === 'd' ? (
              <Check className="h-3 w-3 shrink-0 text-green-500" aria-hidden="true" />
            ) : (
              <Copy className="h-3 w-3 shrink-0 text-muted-foreground/60 transition-colors group-hover:text-foreground" aria-hidden="true" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export function TokenTable({ tokens, className, previewDark: previewDarkProp }: TokenTableProps) {
  const [previewDark, setPreviewDark] = useState(previewDarkProp ?? false);

  // Follow the parent's page-level preview toggle when it changes.
  useEffect(() => {
    if (previewDarkProp !== undefined) setPreviewDark(previewDarkProp);
  }, [previewDarkProp]);

  const lightColors = tokens.colors?.light ?? {};
  const darkColors = tokens.colors?.dark ?? {};

  const colorKeys = Array.from(
    new Set([...Object.keys(lightColors), ...Object.keys(darkColors)])
  ).sort();

  const { typography, spacing, radius, shadows } = tokens;

  const fontFamilyEntries = Object.entries(typography?.fontFamily ?? {});
  const fontSizeEntries = Object.entries(typography?.fontSize ?? {});
  const fontWeightEntries = Object.entries(typography?.fontWeight ?? {});
  const lineHeightEntries = Object.entries(typography?.lineHeight ?? {});
  const letterSpacingEntries = Object.entries(typography?.letterSpacing ?? {});
  // `unit` is the base unit (meta), not a spacing step — exclude it from the step chips.
  const spacingEntries = Object.entries(spacing ?? {}).filter(([k]) => k !== 'unit');
  const radiusEntries = Object.entries(radius ?? {});
  const shadowEntries = Object.entries(shadows ?? {});

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Colors */}
      <section className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5">
          <h3 className="text-sm font-semibold text-foreground">
            Colors <span className="font-normal text-muted-foreground">({colorKeys.length})</span>
          </h3>
          <button
            type="button"
            onClick={() => setPreviewDark((prev) => !prev)}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-pressed={previewDark}
            aria-label="Toggle swatch preview between light and dark mode"
          >
            {previewDark ? (
              <>
                <Moon className="h-3.5 w-3.5" aria-hidden="true" />
                Dark preview
              </>
            ) : (
              <>
                <Sun className="h-3.5 w-3.5" aria-hidden="true" />
                Light preview
              </>
            )}
          </button>
          <p className="w-full text-[11px] text-muted-foreground">
            Previews the swatch color only — the page theme is unchanged. Both light (L) and
            dark (D) values stay copyable below.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {colorKeys.map((key) => (
            <ColorSwatch
              key={key}
              name={key}
              lightValue={lightColors[key]}
              darkValue={darkColors[key]}
              previewDark={previewDark}
            />
          ))}
        </div>
      </section>

      {/* Non-color tokens — dense chip groups */}
      <section className="grid gap-5 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          {fontFamilyEntries.length > 0 && (
            <TokenGroup title="Font Family" cols="grid-cols-1 sm:grid-cols-3">
              {fontFamilyEntries.map(([k, v]) => (
                <CopyPill key={k} label={k} value={String(v)} />
              ))}
            </TokenGroup>
          )}
          {fontSizeEntries.length > 0 && (
            <TokenGroup title="Font Size" cols="grid-cols-2 sm:grid-cols-4">
              {fontSizeEntries.map(([k, v]) => (
                <CopyPill key={k} label={k} value={String(v)} />
              ))}
            </TokenGroup>
          )}
          {(fontWeightEntries.length > 0 || lineHeightEntries.length > 0 || letterSpacingEntries.length > 0) && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {fontWeightEntries.length > 0 && (
                <TokenGroup title="Weight" cols="grid-cols-2">
                  {fontWeightEntries.map(([k, v]) => (
                    <CopyPill key={k} label={k} value={String(v)} />
                  ))}
                </TokenGroup>
              )}
              {lineHeightEntries.length > 0 && (
                <TokenGroup title="Line Height" cols="grid-cols-1">
                  {lineHeightEntries.map(([k, v]) => (
                    <CopyPill key={k} label={k} value={String(v)} />
                  ))}
                </TokenGroup>
              )}
              {letterSpacingEntries.length > 0 && (
                <TokenGroup title="Letter Spacing" cols="grid-cols-1">
                  {letterSpacingEntries.map(([k, v]) => (
                    <CopyPill key={k} label={k} value={String(v)} />
                  ))}
                </TokenGroup>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {spacingEntries.length > 0 && (
            <TokenGroup title="Spacing" cols="grid-cols-2 sm:grid-cols-4">
              {spacingEntries.map(([k, v]) => (
                <CopyPill
                  key={k}
                  label={k}
                  value={String(v)}
                  swatch={
                    <span
                      className="h-3 shrink-0 rounded-sm bg-primary/70"
                      style={{ width: `clamp(2px, ${String(v)}, 20px)` }}
                      aria-hidden="true"
                    />
                  }
                />
              ))}
            </TokenGroup>
          )}
          {radiusEntries.length > 0 && (
            <TokenGroup title="Radius" cols="grid-cols-2 sm:grid-cols-4">
              {radiusEntries.map(([k, v]) => (
                <CopyPill
                  key={k}
                  label={k}
                  value={String(v)}
                  swatch={
                    <span
                      className="h-4 w-4 shrink-0 border border-primary/60 bg-primary/10"
                      style={{ borderRadius: `min(${String(v)}, 8px)` }}
                      aria-hidden="true"
                    />
                  }
                />
              ))}
            </TokenGroup>
          )}
          {shadowEntries.length > 0 && (
            <TokenGroup title="Shadows" cols="grid-cols-1 sm:grid-cols-3">
              {shadowEntries.map(([k, v]) => (
                <CopyPill
                  key={k}
                  label={k}
                  value={String(v)}
                  swatch={
                    <span
                      className="h-4 w-4 shrink-0 rounded bg-card"
                      style={{ boxShadow: String(v) }}
                      aria-hidden="true"
                    />
                  }
                />
              ))}
            </TokenGroup>
          )}
        </div>
      </section>
    </div>
  );
}
