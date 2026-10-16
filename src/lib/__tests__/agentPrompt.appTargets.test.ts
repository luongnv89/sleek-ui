import { buildAgentPrompt, buildAppThemePrompt } from '../agentPrompt';
import { APP_TARGETS, getAvailableAppTargets } from '../appTargets';
import type { DesignData } from '../../types/design';

const makeDesignData = (): DesignData =>
  ({
    $schema: 'https://luongnv.com/sleek-ui/schema/design.v1.json',
    name: 'terminal-pi-dracula',
    version: '1.0.0',
    description: 'Dracula terminal theme',
    categories: ['terminal'],
    collection: 'terminal',
    appTargets: ['pi'],
    tokens: {
      colors: {
        light: { background: '60 30% 96%', foreground: '232 14% 18%', primary: '265 89% 78%' },
        dark: { background: '231 15% 18%', foreground: '60 30% 96%', primary: '265 89% 78%' },
      },
      typography: { fontFamily: { mono: 'JetBrains Mono' } },
      spacing: { unit: '8px' },
      radius: { sm: '0.125rem', default: '0.375rem', lg: '0.5rem', full: '9999px' },
    },
    fonts: { urls: [] },
    tokenColors: [{ scope: 'comment', color: '233 13% 65%' }],
    agentInstructions: { steps: ['apply'] },
  }) as unknown as DesignData;

describe('buildAgentPrompt app targets (#181)', () => {
  it('keeps the legacy web prompt byte-for-byte when no target is given', () => {
    expect(buildAgentPrompt('https://luongnv.com/sleek-ui/designs/stripe.json')).toContain(
      'Fetch the design system at: https://luongnv.com/sleek-ui/designs/stripe.json',
    );
  });

  it('emits a copyable app-theme prompt with style, colors and token-colors', () => {
    const prompt = buildAgentPrompt('https://luongnv.com/sleek-ui/designs/terminal-pi-dracula.json', {
      collection: 'terminal',
      appTarget: 'pi',
      designData: makeDesignData(),
    });
    expect(prompt).toContain('Fetch the app theme at:');
    expect(prompt).toMatch(/STYLE/i);
    expect(prompt).toMatch(/COLORS/i);
    expect(prompt).toMatch(/TOKEN-COLORS/i);
    expect(prompt).toContain('233 13% 65%');
    expect(prompt).toContain('231 15% 18%');
  });

  it('includes target-specific apply instructions for every supported target', () => {
    for (const target of APP_TARGETS) {
      const prompt = buildAppThemePrompt('https://example.com/x.json', target, makeDesignData());
      expect(prompt).toContain('APPLY INSTRUCTIONS');
      expect(prompt.length).toBeGreaterThan(200);
    }
  });

  it('covers all six required targets', () => {
    expect([...APP_TARGETS].sort()).toEqual(
      ['ghostty', 'iterm2', 'opencode', 'pi', 'vscode', 'warp'].sort(),
    );
  });
});

describe('universal apply prompts (#203, #202)', () => {
  const url = 'https://luongnv.com/sleek-ui/designs/terminal-pi-dracula.json';
  const build = (appTarget: 'claude-code' | 'omarchy' | 'ai-tool') =>
    buildAgentPrompt(url, { collection: 'terminal', appTarget, designData: makeDesignData() });

  it('builds a Claude Code theme-change prompt that writes a custom theme and selects it with /theme', () => {
    const prompt = build('claude-code');
    expect(prompt).toContain('Fetch the app theme at:');
    expect(prompt).toContain('This is a Claude Code application theme');
    expect(prompt).toContain('APPLY INSTRUCTIONS (Claude Code)');
    expect(prompt).toContain('~/.claude/themes/<theme-slug>.json');
    expect(prompt).toMatch(/"base": "dark" or "light"/);
    expect(prompt).toContain('"overrides"');
    expect(prompt).toContain('#rrggbb');
    expect(prompt).toContain('/theme');
    expect(prompt).toContain('custom:<theme-slug>');
    // Carries the theme values the agent needs to fill the overrides.
    expect(prompt).toContain('231 15% 18%');
  });

  it('builds an Omarchy OS prompt that writes colors.toml, applies it and verifies the change', () => {
    const prompt = build('omarchy');
    expect(prompt).toContain('APPLY INSTRUCTIONS (Omarchy OS)');
    expect(prompt).toContain('~/.config/omarchy/themes/<theme-slug>/colors.toml');
    for (const key of ['mode', 'accent', 'selection', 'muted', 'dark_background', 'lighter_background', 'bright_foreground', 'bright_magenta']) {
      expect(prompt).toContain(key);
    }
    expect(prompt).toContain('omarchy-theme-set <theme-slug>');
    expect(prompt).toContain('omarchy-theme-current');
    expect(prompt).toMatch(/visibly switch/);
  });

  it('builds a general AI tool prompt that is clearly marked as a placeholder', () => {
    const prompt = build('ai-tool');
    expect(prompt).toContain('APPLY INSTRUCTIONS (General AI tool (placeholder))');
    expect(prompt).toMatch(/PLACEHOLDER/);
  });

  it('gives every offered target, declared or universal, its own apply instructions', () => {
    for (const target of getAvailableAppTargets(APP_TARGETS)) {
      const prompt = buildAppThemePrompt('https://example.com/x.json', target, makeDesignData());
      expect(prompt).toContain('APPLY INSTRUCTIONS (');
      expect(prompt).toContain('Also follow agentInstructions.steps');
    }
  });
});
