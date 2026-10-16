import type { AnyAppTarget, AppTarget, UniversalAppTarget } from '../types/design';

export const APP_TARGETS: readonly AppTarget[] = [
  'pi',
  'ghostty',
  'iterm2',
  'warp',
  'opencode',
  'vscode',
];

/**
 * Targets offered for every theme, after the ones its design file declares.
 * They live in code only: design JSON, the schema and the validator never list
 * them, so `isAppTarget`/`normalizeAppTargets` stay limited to APP_TARGETS.
 */
export const UNIVERSAL_APP_TARGETS: readonly UniversalAppTarget[] = [
  'claude-code',
  'omarchy',
  'ai-tool',
];

/**
 * Targets whose theme format holds UI colors only (no fonts, spacing or
 * second mode). Their prompts drop the STYLE block and the generic
 * "follow agentInstructions.steps / test both modes" tail, which the agent
 * could only report back as skipped.
 */
export const COLOR_ONLY_APP_TARGETS: readonly AnyAppTarget[] = ['claude-code'];

export const APP_TARGET_LABELS: Record<AnyAppTarget, string> = {
  pi: 'Pi',
  ghostty: 'Ghostty',
  iterm2: 'iTerm2',
  warp: 'Warp',
  opencode: 'OpenCode',
  vscode: 'VS Code',
  'claude-code': 'Claude Code',
  omarchy: 'Omarchy OS',
  'ai-tool': 'General AI tool (placeholder)',
};

export const APP_TARGET_INSTRUCTIONS: Record<AnyAppTarget, string> = {
  pi: 'Apply to Pi: copy the token-colors below into your pi theme file (see pi-extensions/themes). Set background/foreground/cursor from tokens.colors.dark, then restart pi.',
  ghostty: 'Apply to Ghostty: map tokens.colors.dark to Ghostty config (background, foreground, palette 0-15 from token-colors). Paste into ~/.config/ghostty/config and reload.',
  iterm2: 'Apply to iTerm2: import token-colors as an .itermcolors profile. Map background/foreground/cursor plus ANSI 0-15, then select the profile in Preferences > Profiles.',
  warp: 'Apply to Warp: create a custom theme from token-colors (background, foreground, accent, ANSI colors) in Warp Settings > Appearance > Themes.',
  opencode: 'Apply to OpenCode: paste token-colors into your opencode theme config. Map primary/background/foreground to UI accents and syntax tokens to editor colors.',
  vscode: 'Apply to VS Code: map token-colors to workbench.colorCustomizations plus editor.tokenColorCustomizations (see vscode-themes seed). Paste into settings.json.',
  'claude-code': 'Apply to Claude Code: write one custom theme file at ~/.claude/themes/<theme-slug>.json shaped {"name": "<theme name>", "base": "dark" or "light", "overrides": {...}}. Use the theme\'s default mode for base and for the tokens.colors palette, and write only that one file. Convert every HSL value to #rrggbb hex. Map overrides: claude and claudeShimmer <- primary, text <- foreground, inverseText <- primary-foreground, inactive and subtle <- muted-foreground, suggestion and permission <- accent (or primary), promptBorder <- border, warning <- the yellow (number) hue from token-colors, error <- destructive, success <- a green hue from token-colors or the palette, or hsl(150 80% 70%) on a dark base and hsl(150 70% 30%) on a light base when there is none, diffAdded/diffRemoved <- dark tints (light tints on a light base) of the success/error hues, userMessageBackground <- muted (or card). Use only these keys; unknown names are ignored. Before writing the file, check contrast against the palette background and adjust lightness only (keep the hue) until every text-colored key reaches 4.5:1, promptBorder reaches 3:1, inverseText reaches 4.5:1 on claude, and text reaches 4.5:1 on userMessageBackground, diffAdded and diffRemoved. A Claude Code theme sets UI colors only and renders on the terminal\'s own background: ignore fonts, spacing, syntax highlighting, the other mode and agentInstructions.steps. Then run /theme in Claude Code and select custom:<theme-slug> (Claude Code reloads ~/.claude/themes/ on change; restart once if that folder did not exist before). When done, reply with only the file path and the /theme step: no contrast figures, color tables, derived-color notes or lists of skipped settings.',
  omarchy: 'Apply to Omarchy OS: create ~/.config/omarchy/themes/<theme-slug>/colors.toml. Convert every HSL value to a quoted "#rrggbb" hex string. Set mode = "dark" or "light" from the theme\'s default mode and use that tokens.colors palette (for a light theme on older Omarchy releases, also add an empty light.mode file in the folder). Fill every key: accent <- primary, selection <- accent (or muted), muted <- muted-foreground; background <- background, dark_background and darker_background <- progressively darker background, lighter_background <- card (or muted); foreground <- foreground, dark_foreground <- muted-foreground, light_foreground and bright_foreground <- progressively lighter foreground; red, yellow, orange, green, cyan, blue, magenta, brown and bright_red, bright_yellow, bright_green, bright_cyan, bright_blue, bright_magenta <- the matching hues from token-colors (derive them from the palette when absent). Add at least one wallpaper image in a backgrounds/ folder next to colors.toml. Then run omarchy-theme-set <theme-slug> and confirm with omarchy-theme-current; the terminal, Waybar and Hyprland window borders should visibly switch to the new colors.',
  'ai-tool': 'Apply with a general AI tool (PLACEHOLDER: tool-specific steps are not written yet). Ask your AI tool to find where the app you want to theme stores its colors, map background/foreground/primary/accent and the syntax token-colors above to that app\'s theme format, write the theme file or settings it reads, then switch to the new theme and reload the app.',
};

export function isAppTarget(value: unknown): value is AppTarget {
  return typeof value === 'string' && (APP_TARGETS as readonly string[]).includes(value);
}

export function normalizeAppTargets(value: unknown): AppTarget[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isAppTarget);
}

export function getAppTargetLabel(target: AnyAppTarget): string {
  return APP_TARGET_LABELS[target];
}

export function isColorOnlyAppTarget(target: AnyAppTarget): boolean {
  return COLOR_ONLY_APP_TARGETS.includes(target);
}

export function getAppTargetInstructions(target: AnyAppTarget): string {
  return APP_TARGET_INSTRUCTIONS[target];
}

/**
 * Targets a theme's apply prompt can offer: the ones its design file declares,
 * then every universal target (#203, #202). Duplicates are dropped.
 */
export function getAvailableAppTargets(designTargets: readonly AppTarget[] = []): AnyAppTarget[] {
  return [...new Set<AnyAppTarget>([...designTargets, ...UNIVERSAL_APP_TARGETS])];
}
