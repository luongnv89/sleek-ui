import type { AppTarget } from '../types/design';

export const APP_TARGETS: readonly AppTarget[] = [
  'pi',
  'ghostty',
  'iterm2',
  'warp',
  'opencode',
  'vscode',
];

export const APP_TARGET_LABELS: Record<AppTarget, string> = {
  pi: 'Pi',
  ghostty: 'Ghostty',
  iterm2: 'iTerm2',
  warp: 'Warp',
  opencode: 'OpenCode',
  vscode: 'VS Code',
};

export const APP_TARGET_INSTRUCTIONS: Record<AppTarget, string> = {
  pi: 'Apply to Pi: copy the token-colors below into your pi theme file (see pi-extensions/themes). Set background/foreground/cursor from tokens.colors.dark, then restart pi.',
  ghostty: 'Apply to Ghostty: map tokens.colors.dark to Ghostty config (background, foreground, palette 0-15 from token-colors). Paste into ~/.config/ghostty/config and reload.',
  iterm2: 'Apply to iTerm2: import token-colors as an .itermcolors profile. Map background/foreground/cursor plus ANSI 0-15, then select the profile in Preferences > Profiles.',
  warp: 'Apply to Warp: create a custom theme from token-colors (background, foreground, accent, ANSI colors) in Warp Settings > Appearance > Themes.',
  opencode: 'Apply to OpenCode: paste token-colors into your opencode theme config. Map primary/background/foreground to UI accents and syntax tokens to editor colors.',
  vscode: 'Apply to VS Code: map token-colors to workbench.colorCustomizations plus editor.tokenColorCustomizations (see vscode-themes seed). Paste into settings.json.',
};

export function isAppTarget(value: unknown): value is AppTarget {
  return typeof value === 'string' && (APP_TARGETS as readonly string[]).includes(value);
}

export function normalizeAppTargets(value: unknown): AppTarget[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isAppTarget);
}

export function getAppTargetLabel(target: AppTarget): string {
  return APP_TARGET_LABELS[target];
}

export function getAppTargetInstructions(target: AppTarget): string {
  return APP_TARGET_INSTRUCTIONS[target];
}
