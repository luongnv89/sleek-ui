import type { AppTarget, DesignData } from '../types/design';
import { APP_TARGET_LABELS, APP_TARGET_INSTRUCTIONS } from './appTargets';
import { COLLECTION_LABELS } from './collections';

export interface AppThemePromptOptions {
  collection?: 'web' | 'terminal' | 'coding';
  appTarget?: AppTarget;
  designData?: DesignData | null;
}

export function buildAgentPrompt(designUrl: string, options?: AppThemePromptOptions): string {
  const collection = options?.collection ?? 'web';
  const appTarget = options?.appTarget;
  if (collection === 'web') {
    return `Fetch the design system at: ${designUrl}

Read the JSON, then follow the steps in agentInstructions.steps to apply this design system to my project:

1. Set CSS custom properties from tokens.colors on :root (light) and .dark (dark mode)
2. Set --radius from tokens.radius.default
3. Load fonts by adding the Google Fonts URL from fonts.urls as a <link> tag
4. Set font-family from tokens.typography.fontFamily
5. Apply component styles from the components field (Tailwind class names for shadcn projects)
6. Ensure focus states match accessibility.focusRing specification
7. Test both light and dark modes

Target framework: Tailwind CSS + shadcn/ui. For other frameworks, map token names to CSS custom properties semantically.`;
  }
  if (!appTarget) {
    return buildGenericAppThemePrompt(designUrl, collection, options?.designData ?? null);
  }
  return buildAppThemePrompt(designUrl, appTarget, options?.designData ?? null);
}

export function buildGenericAppThemePrompt(
  designUrl: string,
  collection: 'terminal' | 'coding',
  designData?: DesignData | null,
): string {
  const label = COLLECTION_LABELS[collection];
  const styleBlock = formatStyleBlock(designData);
  const colorBlock = formatColorBlock(designData);
  const tokenBlock = formatTokenColorBlock(designData);

  return `Fetch the app theme at: ${designUrl}

This is a ${label} application theme (collection: ${designData?.collection ?? collection}). Apply the full style, colors, and syntax token-colors below.

NOTE: No specific app target is selected — apply the full theme below to your app, mapping token names to your app's theme format.

STYLE
${styleBlock}

COLORS (tokens.colors light + dark)
${colorBlock}

TOKEN-COLORS (syntax highlighting)
${tokenBlock}

Also follow agentInstructions.steps from the JSON. Verify background/foreground contrast and test in both light and dark modes where supported.`;
}

export function buildAppThemePrompt(
  designUrl: string,
  appTarget: AppTarget,
  designData?: DesignData | null,
): string {
  const label = APP_TARGET_LABELS[appTarget];
  const instructions = APP_TARGET_INSTRUCTIONS[appTarget];
  const styleBlock = formatStyleBlock(designData);
  const colorBlock = formatColorBlock(designData);
  const tokenBlock = formatTokenColorBlock(designData);

  return `Fetch the app theme at: ${designUrl}

This is a ${label} application theme (collection: ${designData?.collection ?? 'terminal/coding'}). Apply the full style, colors, and syntax token-colors below.

STYLE
${styleBlock}

COLORS (tokens.colors light + dark)
${colorBlock}

TOKEN-COLORS (syntax highlighting)
${tokenBlock}

APPLY INSTRUCTIONS (${label})
${instructions}

Also follow agentInstructions.steps from the JSON. Verify background/foreground contrast and test in both light and dark modes where supported.`;
}

function formatStyleBlock(designData?: DesignData | null): string {
  if (!designData?.tokens) return '(see tokens in fetched JSON)';
  const { typography, spacing, radius, shadows } = designData.tokens;
  const lines: string[] = [];
  if (typography?.fontFamily) lines.push(`fontFamily: ${JSON.stringify(typography.fontFamily)}`);
  if (typography?.fontSize) lines.push(`fontSize: ${JSON.stringify(typography.fontSize)}`);
  if (typography?.fontWeight) lines.push(`fontWeight: ${JSON.stringify(typography.fontWeight)}`);
  if (spacing) lines.push(`spacing: ${JSON.stringify(spacing)}`);
  if (radius) lines.push(`radius: ${JSON.stringify(radius)}`);
  if (shadows) lines.push(`shadows: ${JSON.stringify(shadows)}`);
  return lines.length > 0 ? lines.join('\n') : '(see tokens in fetched JSON)';
}

function formatColorBlock(designData?: DesignData | null): string {
  if (!designData?.tokens?.colors) return '(see tokens.colors in fetched JSON)';
  const { light, dark } = designData.tokens.colors;
  return `light: ${JSON.stringify(light)}\ndark: ${JSON.stringify(dark)}`;
}

function formatTokenColorBlock(designData?: DesignData | null): string {
  const components = (designData as unknown as { tokenColors?: unknown })?.tokenColors;
  if (Array.isArray(components)) return JSON.stringify(components, null, 2);
  // Fall back to deriving syntax colors from the palette so the prompt is
  // always copyable even when a theme has no explicit tokenColors array.
  if (!designData?.tokens?.colors) return '(see tokenColors in fetched JSON)';
  const dark = designData.tokens.colors.dark ?? {};
  const light = designData.tokens.colors.light ?? {};
  const pick = (obj: Record<string, string>, ...keys: string[]) => {
    for (const k of keys) if (obj[k]) return obj[k];
    return '';
  };
  const derived = [
    { scope: 'comment', color: pick(dark, 'muted-foreground', 'muted') || pick(light, 'muted-foreground', 'muted') },
    { scope: 'keyword', color: pick(dark, 'primary') || pick(light, 'primary') },
    { scope: 'string', color: pick(dark, 'accent-foreground', 'secondary-foreground') || pick(light, 'accent-foreground', 'secondary-foreground') },
    { scope: 'variable', color: pick(dark, 'foreground') || pick(light, 'foreground') },
    { scope: 'background', color: pick(dark, 'background') || pick(light, 'background') },
  ];
  return JSON.stringify(derived, null, 2);
}
