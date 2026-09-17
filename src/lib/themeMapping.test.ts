import apple from '../data/designs/apple.json';
import aura from '../data/designs/aura.json';
import type { DesignData } from '../types/design';
import {
  buildMappedThemePrompt,
  contrastRatio,
  mapWebsiteToCodingTheme,
  parseHsl,
} from './themeMapping';

const website = apple as unknown as DesignData;
const backup = aura as unknown as DesignData;

const withDark = (design: DesignData, dark: Record<string, string>, extra: Partial<DesignData> = {}): DesignData => ({
  ...design,
  ...extra,
  tokens: { ...design.tokens, colors: { ...design.tokens.colors, dark: { ...design.tokens.colors.dark, ...dark } } },
});

describe('color helpers', () => {
  it('parses the catalog HSL format and rejects anything else', () => {
    expect(parseHsl('210 100% 45%')).toEqual({ h: 210, s: 100, l: 45 });
    expect(parseHsl('#fff')).toBeNull();
    expect(parseHsl(undefined)).toBeNull();
  });

  it('computes WCAG contrast ratios', () => {
    expect(contrastRatio('0 0% 0%', '0 0% 100%')).toBeCloseTo(21, 0);
    expect(contrastRatio('0 0% 50%', '0 0% 50%')).toBeCloseTo(1, 5);
    expect(contrastRatio('bad', '0 0% 0%')).toBeNull();
  });
});

describe('mapWebsiteToCodingTheme (#187)', () => {
  it('prefers website values and fills missing values from the backup', () => {
    const mapped = mapWebsiteToCodingTheme(website, backup);
    expect(mapped.colors.dark.background).toBe(website.tokens.colors.dark.background);
    expect(mapped.colorSources.dark.background).toBe('website');
    // Apple ships no syntax colors — every token color comes from Aura.
    expect(mapped.tokenColors.map(t => t.scope)).toEqual(backup.tokenColors!.map(t => t.scope));
    expect(Object.values(mapped.tokenColorSources).every(s => s === 'backup' || s === 'website')).toBe(true);
    expect(mapped.fontFamily.mono).toBeDefined();
  });

  it('fills keys the website lacks from the backup', () => {
    const sparse = { ...website, tokens: { ...website.tokens, colors: { light: {}, dark: { background: '0 0% 0%' } } } } as DesignData;
    const mapped = mapWebsiteToCodingTheme(sparse, backup);
    expect(mapped.colors.dark.foreground).toBe(backup.tokens.colors.dark.foreground);
    expect(mapped.colorSources.dark.foreground).toBe('backup');
    expect(mapped.colors.light).toEqual(backup.tokens.colors.light);
  });

  it('flags low-contrast website colors and suggests the backup value', () => {
    const mapped = mapWebsiteToCodingTheme(website, backup);
    const destructive = mapped.conflicts.find(c => c.id === 'dark.destructive');
    expect(destructive).toMatchObject({ kind: 'contrast', currentValue: '0 62.8% 30.6%' });
    expect(destructive!.suggestedValue).toBe(backup.tokens.colors.dark.destructive);
    expect(mapped.colors.dark.destructive).toBe(destructive!.suggestedValue);

    const kept = mapWebsiteToCodingTheme(website, backup, { 'dark.destructive': 'keep' });
    expect(kept.colors.dark.destructive).toBe('0 62.8% 30.6%');
  });

  it('adjusts lightness when the backup value also fails contrast', () => {
    const lowBackup = withDark(backup, { foreground: '0 0% 5%' });
    const lowWebsite = withDark(website, { foreground: '0 0% 8%' });
    const mapped = mapWebsiteToCodingTheme(lowWebsite, lowBackup);
    const conflict = mapped.conflicts.find(c => c.id === 'dark.foreground')!;
    expect(contrastRatio(conflict.suggestedValue, mapped.colors.dark.background)).toBeGreaterThanOrEqual(4.5);
    expect(conflict.suggestion).toMatch(/Adjust lightness/);
    expect(mapped.colorSources.dark.foreground).toBe('website');
  });

  it('flags backup palette colors that are illegible on the website background', () => {
    const sparse = { ...website, tokens: { ...website.tokens, colors: { light: {}, dark: { background: '0 0% 0%' } } } } as DesignData;
    const lowMuted = withDark(backup, { 'muted-foreground': '0 0% 40%' });
    const mapped = mapWebsiteToCodingTheme(sparse, lowMuted);
    const conflict = mapped.conflicts.find(c => c.id === 'dark.muted-foreground')!;
    expect(conflict.kind).toBe('contrast');
    expect(conflict.message).toContain('Backup dark muted-foreground');
    expect(contrastRatio(mapped.colors.dark['muted-foreground'], '0 0% 0%')).toBeGreaterThanOrEqual(4.5);
    expect(mapped.colorSources.dark['muted-foreground']).toBe('backup');
  });

  it('flags backup syntax colors that are illegible on the website background', () => {
    const darkComment = { ...backup, tokenColors: [{ scope: 'comment', color: '0 0% 10%' }] } as DesignData;
    const mapped = mapWebsiteToCodingTheme(website, darkComment);
    const conflict = mapped.conflicts.find(c => c.id === 'tokenColors.comment')!;
    expect(conflict.kind).toBe('syntax-contrast');
    expect(mapped.tokenColors[0].color).toBe(conflict.suggestedValue);
  });

  it('flags a keyword accent that clashes with the website brand color', () => {
    const mapped = mapWebsiteToCodingTheme(website, backup);
    const accent = mapped.conflicts.find(c => c.kind === 'accent-mismatch');
    if (contrastRatio(website.tokens.colors.dark.primary, website.tokens.colors.dark.background)! >= 3) {
      expect(accent?.suggestedValue).toBe(website.tokens.colors.dark.primary);
    }
    const bright = withDark(website, { primary: '120 80% 60%' });
    const brightMapped = mapWebsiteToCodingTheme(bright, backup);
    const keyword = brightMapped.conflicts.find(c => c.id === 'tokenColors.keyword')!;
    expect(keyword.kind).toBe('accent-mismatch');
    expect(brightMapped.tokenColors.find(t => t.scope === 'keyword')!.color).toBe('120 80% 60%');
    expect(brightMapped.tokenColorSources.keyword).toBe('website');
  });

  it('skips the keyword clash check when the website primary is grey or white', () => {
    for (const primary of ['0 0% 100%', '264 2% 40%']) {
      const mapped = mapWebsiteToCodingTheme(withDark(website, { primary }), backup);
      expect(mapped.conflicts.find(c => c.kind === 'accent-mismatch')).toBeUndefined();
      expect(mapped.tokenColorSources.keyword).toBe('backup');
    }
  });

  it('uses website token colors when the website defines them', () => {
    const withSyntax = { ...website, tokenColors: [{ scope: 'keyword', color: '0 0% 90%' }, { scope: 'tag', color: '0 0% 80%' }] } as DesignData;
    const mapped = mapWebsiteToCodingTheme(withSyntax, backup);
    expect(mapped.tokenColors.find(t => t.scope === 'keyword')!.color).toBe('0 0% 90%');
    expect(mapped.tokenColorSources.tag).toBe('website');
  });

  it('flags a default-mode mismatch', () => {
    const lightSite = { ...website, defaultMode: 'light' } as DesignData;
    const mapped = mapWebsiteToCodingTheme(lightSite, backup);
    expect(mapped.conflicts.find(c => c.id === 'mode')).toMatchObject({ suggestedValue: 'dark' });
    expect(mapped.defaultMode).toBe('dark');
    expect(mapWebsiteToCodingTheme(lightSite, backup, { mode: 'keep' }).defaultMode).toBe('light');
  });

  it('checks contrast against the light palette when light mode is kept', () => {
    const lightSite = {
      ...website,
      defaultMode: 'light',
      tokens: { ...website.tokens, colors: { ...website.tokens.colors, light: { ...website.tokens.colors.light, background: '0 0% 100%', foreground: '0 0% 90%' } } },
    } as DesignData;
    const kept = mapWebsiteToCodingTheme(lightSite, backup, { mode: 'keep' });
    expect(kept.defaultMode).toBe('light');
    expect(kept.conflicts.some(c => c.key.startsWith('dark.'))).toBe(false);
    const fg = kept.conflicts.find(c => c.id === 'light.foreground')!;
    expect(fg.kind).toBe('contrast');
    expect(contrastRatio(kept.colors.light.foreground, '0 0% 100%')).toBeGreaterThanOrEqual(4.5);
    const pale = kept.conflicts.find(c => c.kind === 'syntax-contrast');
    if (pale) expect(pale.message).toContain('light background');
    const prompt = buildMappedThemePrompt({ websiteUrl: 'w', websiteName: 'w', backupUrl: 'b', backupName: 'b', mapped: kept, appTarget: 'ghostty' });
    expect(prompt).toContain('tokens.colors.light');
    expect(prompt).not.toContain('tokens.colors.dark');
    expect(prompt).toContain('Checked against the light palette');
  });

  it('holds muted-foreground to the 4.5:1 text minimum', () => {
    // ~3.9:1 on black: passes the accent minimum but fails body text.
    const mapped = mapWebsiteToCodingTheme(withDark(website, { background: '0 0% 0%', 'muted-foreground': '0 0% 40%' }), backup);
    expect(mapped.conflicts.find(c => c.id === 'dark.muted-foreground')?.message).toContain('needs 4.5:1');
  });

  it('infers a light-first backup that also defines a dark palette as light', () => {
    const lightFirst = {
      ...backup,
      defaultMode: undefined,
      agentInstructions: { ...backup.agentInstructions, defaultMode: undefined },
      tokens: { ...backup.tokens, colors: { light: { background: '0 0% 100%' }, dark: { background: '0 0% 10%' } } },
      tokenColors: [{ scope: 'keyword', color: '220 80% 30%' }, { scope: 'comment', color: '0 0% 35%' }],
    } as DesignData;
    const mapped = mapWebsiteToCodingTheme({ ...website, defaultMode: 'light' } as DesignData, lightFirst);
    expect(mapped.conflicts.find(c => c.kind === 'mode-mismatch')).toBeUndefined();
    expect(mapped.defaultMode).toBe('light');
  });

  it('keeps the first of duplicate backup scopes and respects website overrides', () => {
    const dup = { ...backup, tokenColors: [{ scope: 'string', color: '100 50% 60%' }, { scope: 'string', color: '10 50% 60%' }] } as DesignData;
    const site = { ...website, tokenColors: [{ scope: 'string', color: '0 0% 90%' }] } as DesignData;
    const mapped = mapWebsiteToCodingTheme(site, dup);
    expect(mapped.tokenColors).toEqual([{ scope: 'string', color: '0 0% 90%' }]);
    expect(mapped.tokenColorSources).toEqual({ string: 'website' });
  });

  it('reports colors it cannot analyze', () => {
    const hex = { ...backup, tokenColors: [{ scope: 'keyword', color: '#ff0000' }] } as DesignData;
    const mapped = mapWebsiteToCodingTheme(website, hex);
    expect(mapped.uncheckedColors).toContain('tokenColors.keyword');
    const prompt = buildMappedThemePrompt({ websiteUrl: 'w', websiteName: 'w', backupUrl: 'b', backupName: 'b', mapped });
    expect(prompt).toContain('Not analyzed (only H S% L% colors are checked');
  });
});

describe('buildMappedThemePrompt (#187)', () => {
  it('produces a complete Apple + Aura prompt that prefers Apple and falls back to Aura', () => {
    const mapped = mapWebsiteToCodingTheme(website, backup);
    const prompt = buildMappedThemePrompt({
      websiteUrl: 'https://luongnv.com/sleek-ui/designs/apple.json',
      websiteName: 'apple',
      backupUrl: 'https://luongnv.com/sleek-ui/designs/aura.json',
      backupName: 'aura',
      mapped,
      appTarget: 'vscode',
    });
    expect(prompt).toContain('Prefer the website design wherever it defines a value.');
    expect(prompt).toContain('Primary (website design): https://luongnv.com/sleek-ui/designs/apple.json');
    expect(prompt).toContain('Backup (coding theme): https://luongnv.com/sleek-ui/designs/aura.json');
    expect(prompt).toContain(`background: ${website.tokens.colors.dark.background} (website)`);
    expect(prompt).toMatch(/comment: \S+ \S+% \S+%.*\((backup|website)\)/);
    expect(prompt).toContain('CONFLICTS AND INCONSISTENCIES');
    expect(prompt).toContain('dark.destructive');
    expect(prompt).toContain('APPLY INSTRUCTIONS (VS Code)');
    expect(prompt).toMatch(/ask me to confirm or change each choice/);
  });

  it('reports kept choices and no-conflict themes', () => {
    const mapped = mapWebsiteToCodingTheme(website, backup, { 'dark.destructive': 'keep' });
    const prompt = buildMappedThemePrompt({
      websiteUrl: 'w', websiteName: 'w', backupUrl: 'b', backupName: 'b', mapped, choices: { 'dark.destructive': 'keep' },
    });
    expect(prompt).toContain('Selected: keep original → 0 62.8% 30.6%');
    expect(prompt).toContain("Map the values above to your app's theme format");

    const legible = withDark(backup, { 'muted-foreground': '0 0% 60%' }, { tokenColors: [] });
    const clean = mapWebsiteToCodingTheme(legible, legible);
    expect(clean.conflicts).toEqual([]);
    const cleanPrompt = buildMappedThemePrompt({ websiteUrl: 'w', websiteName: 'w', backupUrl: 'b', backupName: 'b', mapped: clean });
    expect(cleanPrompt).toContain('- None detected.');
    expect(cleanPrompt).toContain('(none — derive from the colors above)');
  });
});
