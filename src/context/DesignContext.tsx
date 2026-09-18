import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import type { DesignData, TransformedDesign } from '@/types/design';
import { safeSetItem, safeRemoveItem } from '@/lib/safeStorage';

const STORAGE_KEY = 'sleek-ui:applied-design';
const SAFE_TOKEN_VALUE = /^[A-Za-z0-9 _%.,'"#+/-]+$/;
const SAFE_TOKEN_KEY = /^[A-Za-z0-9_-]+$/;
const HSL_TOKEN = /^(-?(?:\d+(?:\.\d+)?|\.\d+))\s+(-?(?:\d+(?:\.\d+)?|\.\d+))%\s+(-?(?:\d+(?:\.\d+)?|\.\d+))%$/;
const MIN_TEXT_CONTRAST = 4.5;
export const ALLOWED_FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

type Rgb = [number, number, number];

function hslToRgb(value: string | undefined): Rgb | null {
  const match = value?.trim().match(HSL_TOKEN);
  if (!match) return null;

  const hue = ((Number(match[1]) % 360) + 360) % 360;
  const saturation = Math.min(100, Math.max(0, Number(match[2]))) / 100;
  const lightness = Math.min(100, Math.max(0, Number(match[3]))) / 100;
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const x = chroma * (1 - Math.abs((hue / 60) % 2 - 1));
  const offset = lightness - chroma / 2;
  let channels: Rgb;

  if (hue < 60) channels = [chroma, x, 0];
  else if (hue < 120) channels = [x, chroma, 0];
  else if (hue < 180) channels = [0, chroma, x];
  else if (hue < 240) channels = [0, x, chroma];
  else if (hue < 300) channels = [x, 0, chroma];
  else channels = [chroma, 0, x];

  return channels.map(channel => channel + offset) as Rgb;
}

function luminance([red, green, blue]: Rgb): number {
  const linear = [red, green, blue].map(channel =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function rgbContrast(first: Rgb, second: Rgb): number {
  const lighter = Math.max(luminance(first), luminance(second));
  const darker = Math.min(luminance(first), luminance(second));
  return (lighter + 0.05) / (darker + 0.05);
}

function composite(foreground: Rgb, background: Rgb, opacity: number): Rgb {
  return foreground.map(
    (channel, index) => channel * opacity + background[index] * (1 - opacity),
  ) as Rgb;
}

/** WCAG contrast ratio for the catalog's space-separated HSL color tokens. */
export function getContrastRatio(first: string, second: string): number | null {
  const firstRgb = hslToRgb(first);
  const secondRgb = hslToRgb(second);
  return firstRgb && secondRgb ? rgbContrast(firstRgb, secondRgb) : null;
}

function readableForeground(
  preferred: string | undefined,
  primary: Rgb,
  surfaces: Rgb[],
): string | null {
  const candidates = [preferred, '0 0% 0%', '0 0% 100%'].filter(
    (value, index, values): value is string => Boolean(value) && values.indexOf(value) === index,
  );
  return candidates.find(value => {
    const rgb = hslToRgb(value);
    return rgb !== null && [primary, ...surfaces].every(surface => rgbContrast(rgb, surface) >= MIN_TEXT_CONTRAST);
  }) ?? null;
}

/**
 * Applied designs can contain visually valid swatches that are not valid UI
 * pairs. Derive a same-hue primary that remains readable as both small accent
 * text and a button surface, including the translucent backgrounds used by the
 * catalog. The catalog JSON itself remains untouched.
 */
export function withAccessiblePrimary(scale: Record<string, string>): Record<string, string> {
  const primaryMatch = scale.primary?.trim().match(HSL_TOKEN);
  const background = hslToRgb(scale.background);
  if (!primaryMatch || !background) return scale;

  const card = hslToRgb(scale.card) ?? background;
  const muted = hslToRgb(scale.muted);
  const fixedSurfaces = [background, card];
  if (muted) fixedSurfaces.push(composite(muted, background, 0.3));

  const hue = Number(primaryMatch[1]);
  const saturation = Number(primaryMatch[2]);
  const originalLightness = Number(primaryMatch[3]);
  const lightnesses = [
    originalLightness,
    ...Array.from({ length: 1001 }, (_, index) => index / 10).sort(
      (first, second) => Math.abs(first - originalLightness) - Math.abs(second - originalLightness),
    ),
  ];

  for (const lightness of lightnesses) {
    const candidate = `${hue} ${saturation}% ${Number(lightness.toFixed(1))}%`;
    const primary = hslToRgb(candidate)!;
    const accentSurfaces = [
      ...fixedSurfaces,
      composite(primary, background, 0.1),
      composite(primary, card, 0.1),
    ];
    if (accentSurfaces.some(surface => rgbContrast(primary, surface) < MIN_TEXT_CONTRAST)) continue;

    // Primary controls use a 90%-opaque hover surface. Validate that state too,
    // rather than making only the resting CTA readable.
    const controlSurfaces = [
      composite(primary, background, 0.9),
      composite(primary, card, 0.9),
    ];
    const foreground = readableForeground(
      scale['primary-foreground'],
      primary,
      controlSurfaces,
    );
    if (!foreground) continue;

    return { ...scale, primary: candidate, 'primary-foreground': foreground };
  }

  return scale;
}

interface AppliedDesign {
  slug: string;
  name: string;
}

interface StoredDesignEntry extends AppliedDesign {
  data: DesignData;
}

interface DesignContextValue {
  appliedDesign: AppliedDesign | null;
  applyDesign: (design: TransformedDesign, data: DesignData) => void;
  resetDesign: () => void;
  canUndo: boolean;
  undoReset: () => void;
}

const DesignContext = createContext<DesignContextValue | null>(null);

function upsertStyle(id: string, css: string) {
  let el = document.getElementById(id) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement('style');
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = css;
}

function removeStyle(id: string) {
  document.getElementById(id)?.remove();
}

function isSafeTokenValue(value: unknown): value is string {
  return typeof value === 'string' && value.length <= 256 && SAFE_TOKEN_VALUE.test(value);
}

function isSafeColorScale(scale?: Record<string, string>): boolean {
  return Object.entries(scale ?? {}).every(([key, value]) => SAFE_TOKEN_KEY.test(key) && isSafeTokenValue(value));
}

export function isDesignSafe(data: unknown): data is DesignData {
  if (!data || typeof data !== 'object') return false;
  const tokens = (data as DesignData).tokens;
  if (!tokens || typeof tokens !== 'object') return false;
  if (!isSafeColorScale(tokens.colors?.light) || !isSafeColorScale(tokens.colors?.dark)) return false;
  if (tokens.radius?.default != null && !isSafeTokenValue(tokens.radius.default)) return false;
  const fontFamilies = [tokens.typography?.fontFamily?.sans, tokens.typography?.fontFamily?.mono];
  return fontFamilies.every(f => f == null || isSafeTokenValue(f));
}

function isAllowedFontUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && ALLOWED_FONT_HOSTS.includes(parsed.hostname);
  } catch {
    return false;
  }
}

function loadFonts(data: DesignData) {
  document.querySelectorAll('link[data-sleek-font]').forEach(el => el.remove());

  if (data.fonts?.urls?.length) {
    data.fonts.urls.forEach(({ url }) => {
      if (!url || !isAllowedFontUrl(url)) return;
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      link.dataset.sleekFont = 'true';
      document.head.appendChild(link);
    });
  } else if (data.fonts?.google?.length) {
    const families = data.fonts.google
      .filter(f => typeof f.family === 'string' && Array.isArray(f.weights) && f.weights.every(w => typeof w === 'number' && Number.isFinite(w)))
      .map(f => `family=${encodeURIComponent(f.family)}:wght@${f.weights.join(';')}`)
      .join('&');
    if (!families) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
    link.dataset.sleekFont = 'true';
    document.head.appendChild(link);
  }
}

function removeFonts() {
  document.querySelectorAll('link[data-sleek-font]').forEach(el => el.remove());
}

function buildCssVars(data: DesignData): string {
  const { colors, radius, typography } = data.tokens;

  const lightVars = Object.entries(withAccessiblePrimary(colors.light || {}))
    .map(([k, v]) => `  --${k}: ${v};`)
    .join('\n');

  const darkVars = Object.entries(withAccessiblePrimary(colors.dark || {}))
    .map(([k, v]) => `  --${k}: ${v};`)
    .join('\n');

  const radiusVal = radius?.default ?? '0.5rem';
  const fontSans = typography?.fontFamily?.sans ?? 'system-ui, sans-serif';
  const fontMono = typography?.fontFamily?.mono ?? 'monospace';

  return `
:root {
${lightVars}
  --radius: ${radiusVal};
  --font-sans: ${fontSans};
  --font-mono: ${fontMono};
}

.dark {
${darkVars}
  --radius: ${radiusVal};
  --font-sans: ${fontSans};
  --font-mono: ${fontMono};
}

body {
  font-family: ${fontSans};
}
`.trim();
}

export function DesignProvider({ children }: { children: ReactNode }) {
  const [appliedDesign, setAppliedDesign] = useState<AppliedDesign | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (!appliedDesign) return;
    let entry: StoredDesignEntry | null = null;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      entry = stored ? JSON.parse(stored) : null;
    } catch {
      entry = null;
    }
    if (entry && isDesignSafe(entry.data)) {
      upsertStyle('sleek-applied-design', buildCssVars(entry.data));
    }
  }, []);

  // Last reset design, kept so a destructive reset can be undone (#140)
  const [undoEntry, setUndoEntry] = useState<StoredDesignEntry | null>(null);

  const applyDesign = useCallback((design: TransformedDesign, data: DesignData) => {
    if (!isDesignSafe(data)) return;
    const css = buildCssVars(data);
    upsertStyle('sleek-applied-design', css);
    loadFonts(data);

    const entry: AppliedDesign = { slug: design.slug, name: design.name };
    setAppliedDesign(entry);
    setUndoEntry(null);
    safeSetItem(STORAGE_KEY, JSON.stringify({ ...entry, data }));
    safeSetItem(STORAGE_KEY + ':css', css);
  }, []);

  function readStoredEntry(): StoredDesignEntry | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  const resetDesign = useCallback(() => {
    const entry = readStoredEntry();
    setUndoEntry(entry && isDesignSafe(entry.data) ? entry : null);
    removeStyle('sleek-applied-design');
    removeFonts();
    setAppliedDesign(null);
    safeRemoveItem(STORAGE_KEY);
    safeRemoveItem(STORAGE_KEY + ':css');
  }, []);

  const undoReset = useCallback(() => {
    if (!undoEntry || !isDesignSafe(undoEntry.data)) {
      setUndoEntry(null);
      return;
    }
    const css = buildCssVars(undoEntry.data);
    upsertStyle('sleek-applied-design', css);
    loadFonts(undoEntry.data);
    setAppliedDesign({ slug: undoEntry.slug, name: undoEntry.name });
    safeSetItem(STORAGE_KEY, JSON.stringify({ ...undoEntry }));
    safeSetItem(STORAGE_KEY + ':css', css);
    setUndoEntry(null);
  }, [undoEntry]);

  const value = useMemo(
    () => ({ appliedDesign, applyDesign, resetDesign, canUndo: undoEntry !== null, undoReset }),
    [appliedDesign, applyDesign, resetDesign, undoEntry, undoReset]
  );

  return (
    <DesignContext.Provider value={value}>
      {children}
    </DesignContext.Provider>
  );
}

export function useDesign() {
  const ctx = useContext(DesignContext);
  if (!ctx) throw new Error('useDesign must be used within DesignProvider');
  return ctx;
}
