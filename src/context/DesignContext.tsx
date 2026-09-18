import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import type { DesignData, TransformedDesign } from '@/types/design';
import { safeSetItem, safeRemoveItem } from '@/lib/safeStorage';

const STORAGE_KEY = 'sleek-ui:applied-design';
const SAFE_TOKEN_VALUE = /^[A-Za-z0-9 _%.,'"#+/-]+$/;
const SAFE_TOKEN_KEY = /^[A-Za-z0-9_-]+$/;
const HSL_TOKEN = /^(-?(?:\d+(?:\.\d+)?|\.\d+))\s+(-?(?:\d+(?:\.\d+)?|\.\d+))%\s+(-?(?:\d+(?:\.\d+)?|\.\d+))%$/;
const MIN_TEXT_CONTRAST = 4.5;
const MIN_FOCUS_CONTRAST = 3.1;
const SAFE_COLOR_FALLBACKS = {
  light: {
    background: '0 0% 100%',
    foreground: '0 0% 9%',
    card: '0 0% 100%',
    'card-foreground': '0 0% 9%',
    popover: '0 0% 100%',
    'popover-foreground': '0 0% 9%',
    muted: '0 0% 96%',
    'muted-foreground': '0 0% 35%',
    primary: '0 0% 9%',
    'primary-foreground': '0 0% 100%',
    'primary-hover': '0 0% 15%',
    'primary-text': '0 0% 9%',
    secondary: '0 0% 96%',
    'secondary-foreground': '0 0% 9%',
    accent: '0 0% 96%',
    'accent-foreground': '0 0% 9%',
    destructive: '0 0% 9%',
    'destructive-foreground': '0 0% 100%',
    'destructive-text': '0 0% 9%',
    border: '0 0% 85%',
    input: '0 0% 85%',
    ring: '0 0% 20%',
  },
  dark: {
    background: '0 0% 4%',
    foreground: '0 0% 98%',
    card: '0 0% 4%',
    'card-foreground': '0 0% 98%',
    popover: '0 0% 4%',
    'popover-foreground': '0 0% 98%',
    muted: '0 0% 15%',
    'muted-foreground': '0 0% 70%',
    primary: '0 0% 98%',
    'primary-foreground': '0 0% 9%',
    'primary-hover': '0 0% 90%',
    'primary-text': '0 0% 98%',
    secondary: '0 0% 15%',
    'secondary-foreground': '0 0% 98%',
    accent: '0 0% 15%',
    'accent-foreground': '0 0% 98%',
    destructive: '0 0% 98%',
    'destructive-foreground': '0 0% 9%',
    'destructive-text': '0 0% 98%',
    border: '0 0% 25%',
    input: '0 0% 25%',
    ring: '0 0% 80%',
  },
} satisfies Record<'light' | 'dark', Record<string, string>>;
export const ALLOWED_FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

type Rgb = [number, number, number];
type ColorMode = keyof typeof SAFE_COLOR_FALLBACKS;

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

/** Contrast for text over an alpha-composited token, matching Tailwind's `/opacity` states. */
export function getOverlayContrastRatio(
  text: string,
  overlay: string,
  background: string,
  opacity: number,
): number | null {
  const textRgb = hslToRgb(text);
  const overlayRgb = hslToRgb(overlay);
  const backgroundRgb = hslToRgb(background);
  if (!textRgb || !overlayRgb || !backgroundRgb || opacity < 0 || opacity > 1) return null;
  return rgbContrast(textRgb, composite(overlayRgb, backgroundRgb, opacity));
}

/** Contrast when both text and its surface use Tailwind opacity modifiers. */
export function getLayeredContrastRatio(
  text: string,
  textOpacity: number,
  surface: string,
  surfaceOpacity: number,
  background: string,
): number | null {
  const textRgb = hslToRgb(text);
  const surfaceRgb = hslToRgb(surface);
  const backgroundRgb = hslToRgb(background);
  if (
    !textRgb || !surfaceRgb || !backgroundRgb
    || textOpacity < 0 || textOpacity > 1
    || surfaceOpacity < 0 || surfaceOpacity > 1
  ) return null;

  const renderedSurface = composite(surfaceRgb, backgroundRgb, surfaceOpacity);
  return rgbContrast(composite(textRgb, renderedSurface, textOpacity), renderedSurface);
}

function orderedLightnesses(original: number): number[] {
  return [
    original,
    ...Array.from({ length: 1001 }, (_, index) => index / 10).sort(
      (first, second) => Math.abs(first - original) - Math.abs(second - original),
    ),
  ];
}

function readableForeground(
  preferred: Array<string | undefined>,
  fallback: string,
  isReadable: (candidate: Rgb) => boolean,
): string | null {
  const candidates = [...preferred, '0 0% 0%', '0 0% 100%', fallback].filter(
    (value, index, values): value is string => Boolean(value) && values.indexOf(value) === index,
  );
  return candidates.find(value => {
    const rgb = hslToRgb(value);
    return rgb !== null && isReadable(rgb);
  }) ?? null;
}

function primaryHoverCandidates(scale: Record<string, string>): string[] {
  const primaryMatch = scale.primary?.trim().match(HSL_TOKEN);
  if (!primaryMatch) return [scale['primary-hover'], scale.primary].filter(Boolean);

  const hue = Number(primaryMatch[1]);
  const saturation = Number(primaryMatch[2]);
  const originalLightness = Math.min(100, Math.max(0, Number(primaryMatch[3])));
  const nearby = orderedLightnesses(originalLightness)
    .filter(lightness => lightness !== originalLightness)
    .map(lightness => `${hue} ${saturation}% ${Number(lightness.toFixed(1))}%`);
  return [scale['primary-hover'], ...nearby, scale.primary].filter(
    (value, index, values): value is string => Boolean(value) && values.indexOf(value) === index,
  );
}

function renderedTintSurfaces(primary: Rgb, bases: Rgb[]): Rgb[] {
  return bases.flatMap(base => [
    composite(primary, base, 0.05),
    composite(primary, base, 0.1),
  ]);
}

function deriveAccessibleRing(scale: Record<string, string>, surfaces: Rgb[]): string | null {
  const preferredMatch = scale.ring?.trim().match(HSL_TOKEN);
  const candidates = [
    scale.ring,
    scale.primary,
    scale.foreground,
    scale['primary-foreground'],
    '0 0% 0%',
    '0 0% 100%',
  ];
  if (preferredMatch) {
    const hue = Number(preferredMatch[1]);
    const saturation = Number(preferredMatch[2]);
    candidates.push(
      ...orderedLightnesses(Number(preferredMatch[3])).map(
        lightness => `${hue} ${saturation}% ${Number(lightness.toFixed(1))}%`,
      ),
    );
  }

  return candidates.find((value, index) => {
    if (!value || candidates.indexOf(value) !== index) return false;
    const ring = hslToRgb(value);
    return ring !== null && surfaces.every(surface => rgbContrast(ring, surface) >= MIN_FOCUS_CONTRAST);
  }) ?? null;
}

export interface AccessibilityCheck {
  pair: string;
  ratio: number | null;
  minimum: number;
}

/** The finite rendered-surface contract shared by runtime normalization and tests. */
export function getAccessibilityChecks(scale: Record<string, string>): AccessibilityCheck[] {
  const colors = Object.fromEntries(Object.entries({
    background: scale.background,
    foreground: scale.foreground,
    card: scale.card,
    cardForeground: scale['card-foreground'],
    popover: scale.popover,
    popoverForeground: scale['popover-foreground'],
    muted: scale.muted,
    mutedForeground: scale['muted-foreground'],
    primary: scale.primary,
    primaryForeground: scale['primary-foreground'],
    primaryHover: scale['primary-hover'],
    primaryText: scale['primary-text'],
    secondary: scale.secondary,
    secondaryForeground: scale['secondary-foreground'],
    accent: scale.accent,
    accentForeground: scale['accent-foreground'],
    destructive: scale.destructive,
    destructiveForeground: scale['destructive-foreground'],
    destructiveText: scale['destructive-text'],
    ring: scale.ring,
  }).map(([key, value]) => [key, hslToRgb(value)])) as Record<string, Rgb | null>;
  if (Object.values(colors).some(color => color === null)) {
    return [{ pair: 'valid HSL tokens', ratio: null, minimum: MIN_TEXT_CONTRAST }];
  }

  const parsed = colors as Record<keyof typeof colors, Rgb>;
  const promptSurface = composite(parsed.muted, parsed.background, 0.5);
  const muted30 = composite(parsed.muted, parsed.background, 0.3);
  const bases: Array<[string, Rgb]> = [
    ['background', parsed.background],
    ['card', parsed.card],
    ['muted/30 over background', muted30],
  ];
  const primaryTints = bases.flatMap(([baseName, base]) => ([0.05, 0.1] as const).map(opacity => ({
    name: `primary/${opacity * 100} over ${baseName}`,
    surface: composite(parsed.primary, base, opacity),
  })));
  const textPairs: Array<[string, Rgb, Rgb]> = [
    ['foreground/background', parsed.foreground, parsed.background],
    ['foreground/90 on muted/50', composite(parsed.foreground, promptSurface, 0.9), promptSurface],
    ['muted-foreground/background', parsed.mutedForeground, parsed.background],
    ['muted-foreground/card', parsed.mutedForeground, parsed.card],
    ...primaryTints.map(({ name, surface }) => [`muted-foreground/${name}`, parsed.mutedForeground, surface] as [string, Rgb, Rgb]),
    ['primary-foreground/primary', parsed.primaryForeground, parsed.primary],
    ['primary-foreground/primary-hover', parsed.primaryForeground, parsed.primaryHover],
    ...bases.map(([name, surface]) => [`primary-text/${name}`, parsed.primaryText, surface] as [string, Rgb, Rgb]),
    ...primaryTints.map(({ name, surface }) => [`primary-text/${name}`, parsed.primaryText, surface] as [string, Rgb, Rgb]),
    ['secondary-foreground/secondary', parsed.secondaryForeground, parsed.secondary],
    ['accent-foreground/accent', parsed.accentForeground, parsed.accent],
    ['destructive-foreground/destructive', parsed.destructiveForeground, parsed.destructive],
    ['destructive-text/card', parsed.destructiveText, parsed.card],
    ['card-foreground/card', parsed.cardForeground, parsed.card],
    ['popover-foreground/popover', parsed.popoverForeground, parsed.popover],
  ];
  const focusSurfaces = [
    ...bases,
    ...primaryTints
      .filter(({ name }) => !name.includes('muted/30'))
      .map(({ name, surface }) => [name, surface] as [string, Rgb]),
  ];

  return [
    ...textPairs.map(([pair, text, surface]) => ({
      pair,
      ratio: rgbContrast(text, surface),
      minimum: MIN_TEXT_CONTRAST,
    })),
    ...focusSurfaces.map(([name, surface]) => ({
      pair: `ring/${name}`,
      ratio: rgbContrast(parsed.ring, surface),
      minimum: MIN_FOCUS_CONTRAST,
    })),
  ];
}

/** Authoritative postcondition for every runtime-normalized color scale. */
export function isAccessibleColorScale(scale: Record<string, string>): boolean {
  return getAccessibilityChecks(scale).every(
    ({ ratio, minimum }) => ratio !== null && ratio >= minimum,
  );
}

function fallbackScale(scale: Record<string, string>, mode?: ColorMode): Record<string, string> {
  const background = hslToRgb(scale.background);
  const fallbackMode = mode ?? (background && luminance(background) < 0.5 ? 'dark' : 'light');
  return { ...scale, ...SAFE_COLOR_FALLBACKS[fallbackMode] };
}

/**
 * Applied designs can contain visually valid swatches that are not valid UI
 * pairs. Preserve semantic surfaces, narrowly repair their foregrounds, then
 * enforce the finite set of text and focus combinations rendered by the app.
 */
export function withAccessiblePrimary(
  scale: Record<string, string>,
  mode?: ColorMode,
): Record<string, string> {
  const background = hslToRgb(scale.background);
  const fallbackMode = mode ?? (background && luminance(background) < 0.5 ? 'dark' : 'light');
  const safe = SAFE_COLOR_FALLBACKS[fallbackMode];
  const result = { ...scale };
  const surfaceTokens = [
    'background', 'card', 'popover', 'muted', 'primary', 'secondary', 'accent', 'destructive',
  ] as const;
  const parsed = {} as Record<(typeof surfaceTokens)[number], Rgb>;
  for (const token of surfaceTokens) {
    const value = scale[token] ?? safe[token];
    const color = hslToRgb(value);
    if (!color) return fallbackScale(scale, fallbackMode);
    result[token] = value;
    parsed[token] = color;
  }

  const promptSurface = composite(parsed.muted, parsed.background, 0.5);
  const muted30 = composite(parsed.muted, parsed.background, 0.3);
  const primaryTints = renderedTintSurfaces(parsed.primary, [parsed.background, parsed.card, muted30]);
  const primaryTextSurfaces = [parsed.background, parsed.card, muted30, ...primaryTints];
  const foregrounds: Array<[
    keyof typeof SAFE_COLOR_FALLBACKS.light,
    Array<string | undefined>,
    (candidate: Rgb) => boolean,
  ]> = [
    ['foreground', [scale.foreground], candidate =>
      rgbContrast(candidate, parsed.background) >= MIN_TEXT_CONTRAST
      && rgbContrast(composite(candidate, promptSurface, 0.9), promptSurface) >= MIN_TEXT_CONTRAST],
    ['muted-foreground', [scale['muted-foreground'], scale.foreground], candidate =>
      [parsed.background, parsed.card, ...primaryTints].every(surface =>
        rgbContrast(candidate, surface) >= MIN_TEXT_CONTRAST)],
    ['primary-text', [scale['primary-text'], scale.primary, scale.foreground], candidate =>
      primaryTextSurfaces.every(surface => rgbContrast(candidate, surface) >= MIN_TEXT_CONTRAST)],
    ['secondary-foreground', [scale['secondary-foreground']], candidate =>
      rgbContrast(candidate, parsed.secondary) >= MIN_TEXT_CONTRAST],
    ['accent-foreground', [scale['accent-foreground']], candidate =>
      rgbContrast(candidate, parsed.accent) >= MIN_TEXT_CONTRAST],
    ['destructive-foreground', [scale['destructive-foreground']], candidate =>
      rgbContrast(candidate, parsed.destructive) >= MIN_TEXT_CONTRAST],
    ['destructive-text', [scale['destructive-text'], scale.destructive, scale.foreground], candidate =>
      rgbContrast(candidate, parsed.card) >= MIN_TEXT_CONTRAST],
    ['card-foreground', [scale['card-foreground']], candidate =>
      rgbContrast(candidate, parsed.card) >= MIN_TEXT_CONTRAST],
    ['popover-foreground', [scale['popover-foreground']], candidate =>
      rgbContrast(candidate, parsed.popover) >= MIN_TEXT_CONTRAST],
  ];

  for (const [token, preferred, isReadable] of foregrounds) {
    const foreground = readableForeground(preferred, safe[token], isReadable);
    if (!foreground) return fallbackScale(scale, fallbackMode);
    result[token] = foreground;
  }

  const primaryForegroundCandidates = [
    scale['primary-foreground'],
    '0 0% 0%',
    '0 0% 100%',
    safe['primary-foreground'],
  ].filter((value, index, values): value is string =>
    Boolean(value) && values.indexOf(value) === index);
  let primaryPair: { foreground: string; hover: string } | null = null;
  for (const foreground of primaryForegroundCandidates) {
    const foregroundRgb = hslToRgb(foreground);
    if (!foregroundRgb || rgbContrast(foregroundRgb, parsed.primary) < MIN_TEXT_CONTRAST) continue;
    const hover = primaryHoverCandidates(scale).find(candidate => {
      const hoverRgb = hslToRgb(candidate);
      return hoverRgb !== null && rgbContrast(foregroundRgb, hoverRgb) >= MIN_TEXT_CONTRAST;
    });
    if (hover) {
      primaryPair = { foreground, hover };
      break;
    }
  }
  if (!primaryPair) return fallbackScale(scale, fallbackMode);
  result['primary-foreground'] = primaryPair.foreground;
  result['primary-hover'] = primaryPair.hover;

  const focusSurfaces = [
    parsed.background,
    parsed.card,
    muted30,
    ...renderedTintSurfaces(parsed.primary, [parsed.background, parsed.card]),
  ];
  const ring = deriveAccessibleRing(result, focusSurfaces);
  if (!ring) return fallbackScale(scale, fallbackMode);
  result.ring = ring;

  return isAccessibleColorScale(result) ? result : fallbackScale(scale, fallbackMode);
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

  const lightVars = Object.entries(withAccessiblePrimary(colors.light || {}, 'light'))
    .map(([k, v]) => `  --${k}: ${v};`)
    .join('\n');

  const darkVars = Object.entries(withAccessiblePrimary(colors.dark || {}, 'dark'))
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
