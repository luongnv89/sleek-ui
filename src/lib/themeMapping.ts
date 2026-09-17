import type { AppTarget, DesignData } from '../types/design';
import { APP_TARGET_INSTRUCTIONS, APP_TARGET_LABELS } from './appTargets';

/** Where a mapped value came from: the website design (primary) or the backup coding theme. */
export type ValueSource = 'website' | 'backup';

/** How the user resolved a flagged conflict. */
export type ConflictChoice = 'keep' | 'suggested';

export type ConflictKind = 'contrast' | 'syntax-contrast' | 'accent-mismatch' | 'mode-mismatch';

export interface ThemeConflict {
  id: string;
  kind: ConflictKind;
  /** Token the conflict applies to, e.g. 'dark.destructive' or 'tokenColors.comment'. */
  key: string;
  message: string;
  /** Value the mapping would use without intervention. */
  currentValue: string;
  /** Value recommended to resolve the conflict. */
  suggestedValue: string;
  suggestion: string;
}

export type TokenColor = { scope: string; color: string; fontStyle?: string };

export interface MappedTheme {
  colors: { light: Record<string, string>; dark: Record<string, string> };
  colorSources: { light: Record<string, ValueSource>; dark: Record<string, ValueSource> };
  tokenColors: TokenColor[];
  tokenColorSources: Record<string, ValueSource>;
  fontFamily: Record<string, string>;
  fontFamilySources: Record<string, ValueSource>;
  defaultMode: 'light' | 'dark';
  conflicts: ThemeConflict[];
  /** Color tokens that could not be analyzed because they are not in `H S% L%` format. */
  uncheckedColors: string[];
}

const MIN_TEXT_CONTRAST = 4.5;
const MIN_ACCENT_CONTRAST = 3;
const ACCENT_HUE_TOLERANCE = 30;
// Below this saturation a hue is meaningless (grey/white), so no brand clash can be judged.
const MIN_BRAND_SATURATION = 15;
const TEXT_KEYS = new Set(['foreground', 'card-foreground', 'secondary-foreground', 'muted-foreground']);
const ACCENT_KEYS = new Set(['primary', 'accent', 'destructive', 'ring']);

interface Hsl {
  h: number;
  s: number;
  l: number;
}

/** Parse the catalog's `H S% L%` color format. Returns null for anything else. */
export function parseHsl(value: string | undefined): Hsl | null {
  if (typeof value !== 'string') return null;
  const match = value.trim().match(/^(-?\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%$/);
  if (!match) return null;
  return { h: ((Number(match[1]) % 360) + 360) % 360, s: Number(match[2]), l: Number(match[3]) };
}

function formatHsl({ h, s, l }: Hsl): string {
  const round = (n: number) => Math.round(n * 10) / 10;
  return `${round(h)} ${round(s)}% ${round(l)}%`;
}

function luminance({ h, s, l }: Hsl): number {
  const sat = s / 100;
  const light = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sat * Math.min(light, 1 - light);
  const channel = (n: number) => light - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  const linear = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear(channel(0)) + 0.7152 * linear(channel(8)) + 0.0722 * linear(channel(4));
}

/** WCAG contrast ratio between two `H S% L%` colors, or null when either is unparseable. */
export function contrastRatio(a: string | undefined, b: string | undefined): number | null {
  const ha = parseHsl(a);
  const hb = parseHsl(b);
  if (!ha || !hb) return null;
  const [hi, lo] = [luminance(ha), luminance(hb)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Shift lightness away from the background until the color meets `min` contrast. */
function adjustForContrast(color: string, background: string, min: number): string {
  const hsl = parseHsl(color);
  const bg = parseHsl(background);
  if (!hsl || !bg) return color;
  const step = bg.l < 50 ? 2 : -2;
  const candidate = { ...hsl };
  while (candidate.l >= 0 && candidate.l <= 100) {
    if ((contrastRatio(formatHsl(candidate), background) ?? 0) >= min) return formatHsl(candidate);
    candidate.l += step;
  }
  return formatHsl({ ...hsl, l: bg.l < 50 ? 100 : 0 });
}

function hueDistance(a: Hsl, b: Hsl): number {
  const d = Math.abs(a.h - b.h) % 360;
  return d > 180 ? 360 - d : d;
}

function mergeRecord(
  primary: Record<string, string> | undefined,
  backup: Record<string, string> | undefined,
): { values: Record<string, string>; sources: Record<string, ValueSource> } {
  const values: Record<string, string> = {};
  const sources: Record<string, ValueSource> = {};
  for (const [key, value] of Object.entries(backup ?? {})) {
    if (value) {
      values[key] = value;
      sources[key] = 'backup';
    }
  }
  for (const [key, value] of Object.entries(primary ?? {})) {
    if (value) {
      values[key] = value;
      sources[key] = 'website';
    }
  }
  return { values, sources };
}

function meanContrast(colors: string[], background: string | undefined): number | null {
  const ratios = colors.map(c => contrastRatio(c, background)).filter((r): r is number => r !== null);
  return ratios.length ? ratios.reduce((a, b) => a + b, 0) / ratios.length : null;
}

function inferMode(design: DesignData): 'light' | 'dark' {
  if (design.defaultMode) return design.defaultMode;
  if (design.agentInstructions?.defaultMode) return design.agentInstructions.defaultMode;
  const lightBg = design.tokens?.colors?.light?.background;
  const darkBg = design.tokens?.colors?.dark?.background;
  // A theme defining both palettes is judged by which background its syntax colors were designed for.
  const syntax = (design.tokenColors ?? []).filter(t => t.scope !== 'background').map(t => t.color);
  const onLight = meanContrast(syntax, lightBg);
  const onDark = meanContrast(syntax, darkBg);
  if (onLight !== null && onDark !== null) return onLight > onDark ? 'light' : 'dark';
  const bg = parseHsl(darkBg);
  return bg && bg.l < 50 ? 'dark' : 'light';
}

/**
 * Map a website design system onto a complete coding/terminal theme.
 * Website values win wherever they exist; the backup coding theme fills every
 * missing value. Conflicts are detected on the merged result and applied
 * according to `choices` (default: the suggested value).
 */
export function mapWebsiteToCodingTheme(
  website: DesignData,
  backup: DesignData,
  choices: Record<string, ConflictChoice> = {},
): MappedTheme {
  const light = mergeRecord(website.tokens?.colors?.light, backup.tokens?.colors?.light);
  const dark = mergeRecord(website.tokens?.colors?.dark, backup.tokens?.colors?.dark);
  const fonts = mergeRecord(
    website.tokens?.typography?.fontFamily as Record<string, string> | undefined,
    backup.tokens?.typography?.fontFamily as Record<string, string> | undefined,
  );

  const websiteTokenColors = Array.isArray(website.tokenColors) ? website.tokenColors : [];
  const tokenColors: TokenColor[] = [];
  const tokenColorSources: Record<string, ValueSource> = {};
  const websiteByScope = new Map(websiteTokenColors.map(t => [t.scope, t]));
  const seenScopes = new Set<string>();
  for (const entry of backup.tokenColors ?? []) {
    // Duplicate backup scopes would share one source tag and skew coverage; keep the first.
    if (seenScopes.has(entry.scope)) continue;
    seenScopes.add(entry.scope);
    const fromWebsite = websiteByScope.get(entry.scope);
    tokenColors.push({ ...(fromWebsite ?? entry) });
    tokenColorSources[entry.scope] = fromWebsite ? 'website' : 'backup';
    websiteByScope.delete(entry.scope);
  }
  for (const entry of websiteByScope.values()) {
    tokenColors.push({ ...entry });
    tokenColorSources[entry.scope] = 'website';
  }

  const conflicts: ThemeConflict[] = [];
  const websiteMode = website.defaultMode ?? website.agentInstructions?.defaultMode;
  const backupMode = inferMode(backup);
  let defaultMode = websiteMode ?? backupMode;
  if (websiteMode && websiteMode !== backupMode) {
    conflicts.push({
      id: 'mode',
      kind: 'mode-mismatch',
      key: 'defaultMode',
      message: `Website design defaults to ${websiteMode} mode but the backup theme is a ${backupMode} theme.`,
      currentValue: websiteMode,
      suggestedValue: backupMode,
      suggestion: `Use ${backupMode} mode so the backup syntax colors stay legible.`,
    });
    defaultMode = (choices.mode ?? 'suggested') === 'suggested' ? backupMode : websiteMode;
  }

  // Every legibility check runs against the palette of the mode the theme will actually use.
  const mode = defaultMode;
  const palette = mode === 'dark' ? dark : light;
  const backupPalette = backup.tokens?.colors?.[mode];
  const websitePalette = website.tokens?.colors?.[mode];
  const background = palette.values.background;
  const uncheckedColors = new Set<string>();
  const checkable = (key: string, value: string | undefined) => {
    if (parseHsl(value)) return true;
    if (value) uncheckedColors.add(key);
    return false;
  };
  checkable(`${mode}.background`, background);

  for (const [key, value] of Object.entries(palette.values)) {
    const isText = TEXT_KEYS.has(key);
    if (!isText && !ACCENT_KEYS.has(key)) continue;
    if (palette.sources[key] !== 'website') continue;
    if (!checkable(`${mode}.${key}`, value)) continue;
    const min = isText ? MIN_TEXT_CONTRAST : MIN_ACCENT_CONTRAST;
    const ratio = contrastRatio(value, background);
    if (ratio === null || ratio >= min) continue;
    const backupValue = backupPalette?.[key];
    const backupRatio = contrastRatio(backupValue, background);
    const suggestedValue =
      backupValue && backupRatio !== null && backupRatio >= min
        ? backupValue
        : adjustForContrast(value, background, min);
    const fromBackup = suggestedValue === backupValue;
    conflicts.push({
      id: `${mode}.${key}`,
      kind: 'contrast',
      key: `${mode}.${key}`,
      message: `Website ${mode} ${key} (${value}) has ${ratio.toFixed(2)}:1 contrast on the background (${background}); needs ${min}:1.`,
      currentValue: value,
      suggestedValue,
      suggestion: fromBackup
        ? `Use the backup theme's ${key} (${suggestedValue}).`
        : `Adjust lightness to ${suggestedValue}.`,
    });
  }

  const primaryValue = websitePalette?.primary;
  const websitePrimary = parseHsl(primaryValue);
  tokenColors.forEach(entry => {
    if (entry.scope === 'background' || tokenColorSources[entry.scope] !== 'backup') return;
    if (!checkable(`tokenColors.${entry.scope}`, entry.color)) return;
    const ratio = contrastRatio(entry.color, background);
    if (ratio !== null && ratio < MIN_ACCENT_CONTRAST) {
      const suggestedValue = adjustForContrast(entry.color, background, MIN_ACCENT_CONTRAST);
      conflicts.push({
        id: `tokenColors.${entry.scope}`,
        kind: 'syntax-contrast',
        key: `tokenColors.${entry.scope}`,
        message: `Backup ${entry.scope} color (${entry.color}) has ${ratio.toFixed(2)}:1 contrast on the website ${mode} background (${background}).`,
        currentValue: entry.color,
        suggestedValue,
        suggestion: `Adjust lightness to ${suggestedValue}.`,
      });
      return;
    }
    const color = parseHsl(entry.color)!;
    if (entry.scope === 'keyword' && primaryValue && websitePrimary && websitePrimary.s >= MIN_BRAND_SATURATION && hueDistance(websitePrimary, color) > ACCENT_HUE_TOLERANCE) {
      const primaryRatio = contrastRatio(primaryValue, background);
      if (primaryRatio === null || primaryRatio < MIN_ACCENT_CONTRAST) return;
      conflicts.push({
        id: `tokenColors.${entry.scope}`,
        kind: 'accent-mismatch',
        key: `tokenColors.${entry.scope}`,
        message: `Backup keyword color (${entry.color}) clashes with the website's primary brand color (${primaryValue}).`,
        currentValue: entry.color,
        suggestedValue: primaryValue,
        suggestion: `Use the website primary (${primaryValue}) for keywords so the theme reads as the website brand.`,
      });
    }
  });

  for (const conflict of conflicts) {
    if (conflict.kind === 'mode-mismatch') continue;
    const value = (choices[conflict.id] ?? 'suggested') === 'suggested' ? conflict.suggestedValue : conflict.currentValue;
    if (conflict.kind === 'contrast') {
      const key = conflict.key.slice(`${mode}.`.length);
      palette.values[key] = value;
      if (value !== conflict.currentValue && value === backupPalette?.[key]) palette.sources[key] = 'backup';
    } else {
      const scope = conflict.key.slice('tokenColors.'.length);
      const entry = tokenColors.find(t => t.scope === scope);
      if (entry) entry.color = value;
      if (conflict.kind === 'accent-mismatch' && value !== conflict.currentValue) tokenColorSources[scope] = 'website';
    }
  }

  return {
    colors: { light: light.values, dark: dark.values },
    colorSources: { light: light.sources, dark: dark.sources },
    tokenColors,
    tokenColorSources,
    fontFamily: fonts.values,
    fontFamilySources: fonts.sources,
    defaultMode,
    conflicts,
    uncheckedColors: [...uncheckedColors],
  };
}

function countSources(sources: Record<string, ValueSource>): { website: number; backup: number } {
  const values = Object.values(sources);
  return {
    website: values.filter(s => s === 'website').length,
    backup: values.filter(s => s === 'backup').length,
  };
}

function formatSourcedRecord(values: Record<string, string>, sources: Record<string, ValueSource>): string {
  return Object.entries(values)
    .map(([key, value]) => `  ${key}: ${value} (${sources[key]})`)
    .join('\n');
}

export interface MappedThemePromptOptions {
  websiteUrl: string;
  websiteName: string;
  backupUrl: string;
  backupName: string;
  mapped: MappedTheme;
  choices?: Record<string, ConflictChoice>;
  appTarget?: AppTarget;
}

/** Prompt that applies a website design as a complete coding/terminal theme with a backup fallback. */
export function buildMappedThemePrompt({
  websiteUrl,
  websiteName,
  backupUrl,
  backupName,
  mapped,
  choices = {},
  appTarget,
}: MappedThemePromptOptions): string {
  const colorCounts = countSources({ ...mapped.colorSources.light, ...prefixKeys(mapped.colorSources.dark) });
  const tokenCounts = countSources(mapped.tokenColorSources);
  const tokenLines = mapped.tokenColors
    .map(t => `  ${t.scope}: ${t.color}${t.fontStyle ? ` ${t.fontStyle}` : ''} (${mapped.tokenColorSources[t.scope] ?? 'backup'})`)
    .join('\n');
  const conflictLines = mapped.conflicts.length
    ? mapped.conflicts
        .map(c => {
          const choice = choices[c.id] ?? 'suggested';
          const applied = choice === 'suggested' ? c.suggestedValue : c.currentValue;
          return `- ${c.key}: ${c.message} Suggestion: ${c.suggestion} Selected: ${choice === 'suggested' ? 'suggested' : 'keep original'} → ${applied}`;
        })
        .join('\n')
    : '- None detected.';
  const uncheckedLine = mapped.uncheckedColors.length
    ? `Not analyzed (only H S% L% colors are checked — verify manually): ${mapped.uncheckedColors.join(', ')}\n`
    : '';
  const applySection = appTarget
    ? `APPLY INSTRUCTIONS (${APP_TARGET_LABELS[appTarget]})\n${APP_TARGET_INSTRUCTIONS[appTarget].split('tokens.colors.dark').join(`tokens.colors.${mapped.defaultMode}`)}\n\n`
    : `APPLY INSTRUCTIONS\nMap the values above to your app's theme format (terminal palette, editor workbench colors, syntax token colors).\n\n`;

  return `Build a complete coding/terminal theme from the website design "${websiteName}", using "${backupName}" as the backup theme.

Primary (website design): ${websiteUrl}
Backup (coding theme): ${backupUrl}

MAPPING RULES
1. Prefer the website design wherever it defines a value.
2. Fill every value the website design lacks from the backup theme so the result is complete.
3. Each value below is tagged (website) or (backup) with its source.

Coverage: colors ${colorCounts.website} from website / ${colorCounts.backup} from backup; syntax token-colors ${tokenCounts.website} from website / ${tokenCounts.backup} from backup.

DEFAULT MODE
${mapped.defaultMode}

FONTS (tokens.typography.fontFamily)
${formatSourcedRecord(mapped.fontFamily, mapped.fontFamilySources)}

COLORS — dark
${formatSourcedRecord(mapped.colors.dark, mapped.colorSources.dark)}

COLORS — light
${formatSourcedRecord(mapped.colors.light, mapped.colorSources.light)}

TOKEN-COLORS (syntax highlighting)
${tokenLines || '  (none — derive from the colors above)'}

CONFLICTS AND INCONSISTENCIES (validate before applying)
Checked against the ${mapped.defaultMode} palette. The brand-accent check covers the keyword scope only.
${conflictLines}
${uncheckedLine}
${applySection}Before writing any theme file, show me the conflicts above with the selected resolution and ask me to confirm or change each choice. Then apply the theme and verify background/foreground contrast.`;
}

function prefixKeys(record: Record<string, ValueSource>): Record<string, ValueSource> {
  return Object.fromEntries(Object.entries(record).map(([k, v]) => [`dark.${k}`, v]));
}
