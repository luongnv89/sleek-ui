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
}

const MIN_TEXT_CONTRAST = 4.5;
const MIN_ACCENT_CONTRAST = 3;
const ACCENT_HUE_TOLERANCE = 30;
const TEXT_KEYS = new Set(['foreground', 'card-foreground', 'secondary-foreground']);
const ACCENT_KEYS = new Set(['primary', 'accent', 'destructive', 'muted-foreground', 'ring']);

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

function inferMode(design: DesignData): 'light' | 'dark' {
  if (design.defaultMode) return design.defaultMode;
  if (design.agentInstructions?.defaultMode) return design.agentInstructions.defaultMode;
  const bg = parseHsl(design.tokens?.colors?.dark?.background);
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
  for (const entry of backup.tokenColors ?? []) {
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
  }

  const background = dark.values.background;
  for (const [key, value] of Object.entries(dark.values)) {
    const isText = TEXT_KEYS.has(key);
    if (!isText && !ACCENT_KEYS.has(key)) continue;
    if (dark.sources[key] !== 'website') continue;
    const min = isText ? MIN_TEXT_CONTRAST : MIN_ACCENT_CONTRAST;
    const ratio = contrastRatio(value, background);
    if (ratio === null || ratio >= min) continue;
    const backupValue = backup.tokens?.colors?.dark?.[key];
    const backupRatio = contrastRatio(backupValue, background);
    const suggestedValue =
      backupValue && backupRatio !== null && backupRatio >= min
        ? backupValue
        : adjustForContrast(value, background, min);
    const fromBackup = suggestedValue === backupValue;
    conflicts.push({
      id: `dark.${key}`,
      kind: 'contrast',
      key: `dark.${key}`,
      message: `Website dark ${key} (${value}) has ${ratio.toFixed(2)}:1 contrast on the background (${background}); needs ${min}:1.`,
      currentValue: value,
      suggestedValue,
      suggestion: fromBackup
        ? `Use the backup theme's ${key} (${suggestedValue}).`
        : `Adjust lightness to ${suggestedValue}.`,
    });
  }

  const websitePrimary = parseHsl(website.tokens?.colors?.dark?.primary);
  tokenColors.forEach(entry => {
    if (entry.scope === 'background' || tokenColorSources[entry.scope] !== 'backup') return;
    const ratio = contrastRatio(entry.color, background);
    if (ratio !== null && ratio < MIN_ACCENT_CONTRAST) {
      const suggestedValue = adjustForContrast(entry.color, background, MIN_ACCENT_CONTRAST);
      conflicts.push({
        id: `tokenColors.${entry.scope}`,
        kind: 'syntax-contrast',
        key: `tokenColors.${entry.scope}`,
        message: `Backup ${entry.scope} color (${entry.color}) has ${ratio.toFixed(2)}:1 contrast on the website background (${background}).`,
        currentValue: entry.color,
        suggestedValue,
        suggestion: `Adjust lightness to ${suggestedValue}.`,
      });
      return;
    }
    const color = parseHsl(entry.color);
    if (entry.scope === 'keyword' && websitePrimary && color && hueDistance(websitePrimary, color) > ACCENT_HUE_TOLERANCE) {
      const primaryValue = website.tokens.colors.dark.primary;
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

  let defaultMode = websiteMode ?? backupMode;
  for (const conflict of conflicts) {
    const value = (choices[conflict.id] ?? 'suggested') === 'suggested' ? conflict.suggestedValue : conflict.currentValue;
    if (conflict.kind === 'mode-mismatch') {
      defaultMode = value as 'light' | 'dark';
    } else if (conflict.kind === 'contrast') {
      const key = conflict.key.slice('dark.'.length);
      dark.values[key] = value;
      if (value !== conflict.currentValue && value === backup.tokens?.colors?.dark?.[key]) dark.sources[key] = 'backup';
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
  const applySection = appTarget
    ? `APPLY INSTRUCTIONS (${APP_TARGET_LABELS[appTarget]})\n${APP_TARGET_INSTRUCTIONS[appTarget]}\n\n`
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
${conflictLines}

${applySection}Before writing any theme file, show me the conflicts above with the selected resolution and ask me to confirm or change each choice. Then apply the theme and verify background/foreground contrast.`;
}

function prefixKeys(record: Record<string, ValueSource>): Record<string, ValueSource> {
  return Object.fromEntries(Object.entries(record).map(([k, v]) => [`dark.${k}`, v]));
}
