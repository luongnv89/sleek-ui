import { buildAgentPrompt, buildAppThemePrompt } from '../agentPrompt';
import { APP_TARGETS } from '../appTargets';
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
