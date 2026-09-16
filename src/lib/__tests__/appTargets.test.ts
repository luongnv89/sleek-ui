import {
  APP_TARGETS,
  getAppTargetInstructions,
  getAppTargetLabel,
  isAppTarget,
  normalizeAppTargets,
} from '../appTargets';
import { buildAppThemePrompt } from '../agentPrompt';

describe('appTargets (#181)', () => {
  it('recognizes only the six supported targets', () => {
    expect(isAppTarget('pi')).toBe(true);
    expect(isAppTarget('vscode')).toBe(true);
    expect(isAppTarget('sublime')).toBe(false);
    expect(isAppTarget(42)).toBe(false);
    expect(isAppTarget(null)).toBe(false);
  });

  it('normalizes mixed arrays and non-arrays safely', () => {
    expect(normalizeAppTargets(['pi', 'nope', 'vscode'])).toEqual(['pi', 'vscode']);
    expect(normalizeAppTargets('pi')).toEqual([]);
    expect(normalizeAppTargets(null)).toEqual([]);
    expect(normalizeAppTargets(undefined)).toEqual([]);
  });

  it('exposes a label and instructions per target', () => {
    for (const target of APP_TARGETS) {
      expect(getAppTargetLabel(target).length).toBeGreaterThan(0);
      expect(getAppTargetInstructions(target).length).toBeGreaterThan(20);
    }
  });

  it('falls back to JSON pointers when design data is absent', () => {
    const prompt = buildAppThemePrompt('https://example.com/t.json', 'ghostty', null);
    expect(prompt).toContain('(see tokens in fetched JSON)');
    expect(prompt).toContain('(see tokens.colors in fetched JSON)');
    expect(prompt).toContain('(see tokenColors in fetched JSON)');
  });

  it('derives token-colors from the palette when no tokenColors array exists', () => {
    const prompt = buildAppThemePrompt(
      'https://example.com/t.json',
      'warp',
      {
        tokens: {
          colors: {
            light: { background: '0 0% 100%', foreground: '0 0% 0%', primary: '0 0% 50%' },
            dark: { background: '0 0% 0%', foreground: '0 0% 100%', primary: '0 0% 60%' },
          },
        },
      } as never,
    );
    expect(prompt).toContain('"scope": "comment"');
    expect(prompt).toContain('"scope": "keyword"');
  });
});
