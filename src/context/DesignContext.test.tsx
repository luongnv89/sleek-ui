import { memo } from 'react';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { render, screen, fireEvent, act } from '@testing-library/react';
import {
  DesignProvider,
  getAccessibilityChecks,
  getContrastRatio,
  getLayeredContrastRatio,
  getOverlayContrastRatio,
  isAccessibleColorScale,
  useDesign,
  withAccessiblePrimary,
} from './DesignContext';
import airtable from '@/data/designs/airtable.json';
import elevenLabs from '@/data/designs/elevenlabs.json';
import linear from '@/data/designs/linear.app.json';
import neonGreen from '@/data/designs/neon-green.json';
import openCode from '@/data/designs/opencode.json';
import vercel from '@/data/designs/vercel.json';
import voltAgent from '@/data/designs/voltagent.json';
import type { DesignData, TransformedDesign } from '@/types/design';

const baseDesign: DesignData = {
  $schema: 'https://luongnv.com/sleek-ui/schema/design.v1.json',
  name: 'Test Design',
  version: '1.0.0',
  description: 'A test design',
  categories: ['ui'],
  tokens: {
    colors: {
      light: { background: '0 0% 100%', primary: '245 90% 73%' },
      dark: { background: '240 33% 14%', primary: '245 90% 73%' },
    },
    typography: { fontFamily: { sans: 'Inter, sans-serif', mono: 'monospace' } },
    spacing: { unit: '0.25rem' },
    radius: { sm: '0.25rem', default: '0.5rem', lg: '1rem', full: '9999px' },
  },
  fonts: { google: [{ family: 'Inter', weights: [400, 700] }] },
  agentInstructions: { steps: [] },
} as unknown as DesignData;

function makeDesign(overrides: Record<string, unknown>): DesignData {
  const merged = JSON.parse(JSON.stringify(baseDesign));
  for (const [path, value] of Object.entries(overrides)) {
    const keys = path.split('.');
    let target: Record<string, unknown> = merged;
    while (keys.length > 1) {
      const key = keys.shift() as string;
      if (!target[key] || typeof target[key] !== 'object') target[key] = {};
      target = target[key] as Record<string, unknown>;
    }
    target[keys[0]] = value;
  }
  return merged;
}

function toTransformed(): TransformedDesign {
  return {
    slug: 'test-slug',
    name: 'Test Design',
    categories: [],
    colors: { primary: '', secondary: '' },
    defaultMode: 'light',
    jsonUrl: '',
    thumbnailUrl: '',
    detailUrl: '',
    description: '',
  };
}

function ApplyButton({ data }: { data: DesignData }) {
  const { applyDesign } = useDesign();
  return <button onClick={() => applyDesign(toTransformed(), data)}>apply</button>;
}

function ResetButton() {
  const { resetDesign } = useDesign();
  return <button onClick={resetDesign}>reset</button>;
}

function getAppliedStyle(): HTMLElement | null {
  return document.getElementById('sleek-applied-design');
}

function readDefaultCssPalette(selector: ':root' | '.dark'): Record<string, string> {
  const stylesheet = readFileSync(join(process.cwd(), 'src/index.css'), 'utf8');
  const escapedSelector = selector === ':root' ? ':root' : '\\.dark';
  const block = stylesheet.match(new RegExp(`${escapedSelector} \\{([\\s\\S]*?)\\n  \\}`))?.[1] ?? '';
  return Object.fromEntries(
    [...block.matchAll(/--([a-z-]+):\s*([^;]+);/g)].map(match => [match[1], match[2].trim()]),
  );
}

beforeEach(() => {
  localStorage.clear();
  document.head.innerHTML = '';
});

describe('DesignContext validation (#102)', () => {
  it('applies a legitimate catalog-style design by mutating CSS custom properties', () => {
    render(
      <DesignProvider>
        <ApplyButton data={baseDesign} />
      </DesignProvider>,
    );
    fireEvent.click(screen.getByText('apply'));
    const css = getAppliedStyle()?.textContent ?? '';
    expect(css).toContain('--background: 0 0% 100%;');
    expect(css).toContain(
      `--primary: ${withAccessiblePrimary(baseDesign.tokens.colors.light).primary};`,
    );
    expect(css).toContain('--radius: 0.5rem;');
    expect(css).toContain('--font-sans: Inter, sans-serif;');
    expect(css).toContain('.dark {');
  });

  it.each([
    ['light', ':root'],
    ['dark', '.dark'],
  ] as const)('keeps the unapplied %s CSS palette inside the runtime accessibility contract', (_mode, selector) => {
    const palette = readDefaultCssPalette(selector);
    const failures = getAccessibilityChecks(palette).filter(
      ({ ratio, minimum }) => ratio === null || ratio < minimum,
    );
    expect(failures).toEqual([]);
  });

  it('repairs Linear light foreground text and its translucent prompt surface', () => {
    const source = linear.tokens.colors.light;
    const normalized = withAccessiblePrimary(source, 'light');
    expect(normalized.background).toBe(source.background);
    expect(normalized.muted).toBe(source.muted);
    expect(getContrastRatio(normalized.foreground, normalized.background)).toBeGreaterThanOrEqual(4.5);
    expect(
      getLayeredContrastRatio(
        normalized.foreground,
        0.9,
        normalized.muted,
        0.5,
        normalized.background,
      ),
    ).toBeGreaterThanOrEqual(4.5);
  });

  it('repairs Neon Green light muted text on background and card', () => {
    const source = neonGreen.tokens.colors.light;
    const normalized = withAccessiblePrimary(source, 'light');
    expect(normalized.background).toBe(source.background);
    expect(normalized.card).toBe(source.card);
    expect(getContrastRatio(normalized['muted-foreground'], normalized.background)).toBeGreaterThanOrEqual(4.5);
    expect(getContrastRatio(normalized['muted-foreground'], normalized.card)).toBeGreaterThanOrEqual(4.5);
  });

  it('repairs OpenCode dark outline hover text', () => {
    const source = openCode.tokens.colors.dark;
    const normalized = withAccessiblePrimary(source, 'dark');
    expect(normalized.accent).toBe(source.accent);
    expect(getContrastRatio(normalized['accent-foreground'], normalized.accent)).toBeGreaterThanOrEqual(4.5);
  });

  it('repairs Vercel light focus rings on primary-tinted surfaces', () => {
    const source = vercel.tokens.colors.light;
    const normalized = withAccessiblePrimary(source, 'light');
    expect(normalized.background).toBe(source.background);
    expect(normalized.card).toBe(source.card);
    expect(normalized.muted).toBe(source.muted);
    expect(normalized.primary).toBe(source.primary);
    expect(
      getOverlayContrastRatio(normalized.ring, normalized.primary, normalized.background, 0.05),
    ).toBeGreaterThanOrEqual(3.1);
  });

  it('repairs ElevenLabs informational, button, error, and ring roles', () => {
    const source = elevenLabs.tokens.colors.light;
    const colors = withAccessiblePrimary(source, 'light');
    expect(colors.background).toBe(source.background);
    expect(colors.card).toBe(source.card);
    expect(colors.primary).toBe(source.primary);
    expect(colors['primary-text']).not.toBe(source.primary);
    expect(getContrastRatio(colors['primary-foreground'], colors['primary-hover'])).toBeGreaterThanOrEqual(4.5);
    expect(getContrastRatio(colors['destructive-text'], colors.card)).toBeGreaterThanOrEqual(4.5);
    expect(isAccessibleColorScale(colors)).toBe(true);
  });

  it('repairs Airtable dark focus rings on primary tints nested in cards', () => {
    const source = airtable.tokens.colors.dark;
    const colors = withAccessiblePrimary(source, 'dark');
    expect(colors.background).toBe(source.background);
    expect(colors.card).toBe(source.card);
    expect(colors.primary).toBe(source.primary);
    const ringOnPrimary10Card = getAccessibilityChecks(colors).find(
      check => check.pair === 'ring/primary/10 over card',
    );
    expect(ringOnPrimary10Card?.ratio).toBeGreaterThanOrEqual(3.1);
    expect(isAccessibleColorScale(colors)).toBe(true);
  });

  it('repairs VoltAgent muted text on actual primary tints and its opaque hover', () => {
    const source = voltAgent.tokens.colors.light;
    const colors = withAccessiblePrimary(source, 'light');
    expect(colors.background).toBe(source.background);
    expect(colors.card).toBe(source.card);
    expect(colors.primary).toBe(source.primary);
    expect(getOverlayContrastRatio(
      colors['muted-foreground'], colors.primary, colors.card, 0.1,
    )).toBeGreaterThanOrEqual(4.5);
    expect(colors['primary-hover']).toMatch(/^\d+(?:\.\d+)? \d+(?:\.\d+)?% \d+(?:\.\d+)?%$/);
    expect(isAccessibleColorScale(colors)).toBe(true);
  });

  it('uses the complete safe palette when no foreground can satisfy every rendered surface', () => {
    const impossible = {
      background: '0 0% 0%',
      foreground: '0 0% 100%',
      card: '0 0% 0%',
      'card-foreground': '0 0% 100%',
      popover: '0 0% 0%',
      'popover-foreground': '0 0% 100%',
      muted: '0 0% 100%',
      'muted-foreground': '0 0% 100%',
      primary: '0 0% 0%',
      'primary-foreground': '0 0% 100%',
      secondary: '0 0% 0%',
      'secondary-foreground': '0 0% 100%',
      accent: '0 0% 0%',
      'accent-foreground': '0 0% 100%',
      destructive: '0 0% 0%',
      'destructive-foreground': '0 0% 100%',
      ring: '0 0% 100%',
    };
    const normalized = withAccessiblePrimary(impossible, 'light');
    const safeLight = {
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
    };

    expect(normalized).toEqual(safeLight);
    expect(isAccessibleColorScale(normalized)).toBe(true);
  });

  it('fails closed for adversarially different background and card surfaces', () => {
    const adversarial = {
      ...baseDesign.tokens.colors.light,
      background: '0 0% 0%',
      foreground: '0 0% 100%',
      card: '0 0% 100%',
      'card-foreground': '0 0% 0%',
      popover: '0 0% 0%',
      'popover-foreground': '0 0% 100%',
      muted: '0 0% 10%',
      'muted-foreground': '0 0% 100%',
      primary: '0 0% 0%',
      'primary-foreground': '0 0% 100%',
      secondary: '0 0% 0%',
      'secondary-foreground': '0 0% 100%',
      accent: '0 0% 0%',
      'accent-foreground': '0 0% 100%',
      destructive: '0 0% 0%',
      'destructive-foreground': '0 0% 100%',
      ring: '0 0% 50%',
    };
    const normalized = withAccessiblePrimary(adversarial, 'light');
    expect(normalized.background).toBe('0 0% 100%');
    expect(normalized.card).toBe('0 0% 100%');
    expect(normalized['primary-text']).toBe('0 0% 9%');
    expect(isAccessibleColorScale(normalized)).toBe(true);
  });

  it('normalizes every available catalog color mode to the exact accessibility matrix', () => {
    const designsDirectory = join(process.cwd(), 'src/data/designs');
    const failures: string[] = [];

    for (const file of readdirSync(designsDirectory).filter(name => name.endsWith('.json'))) {
      const data = JSON.parse(readFileSync(join(designsDirectory, file), 'utf8')) as DesignData;
      for (const mode of ['light', 'dark'] as const) {
        const source = data.tokens.colors[mode];
        if (!source) continue;
        const colors = withAccessiblePrimary(source, mode);
        for (const { pair, ratio, minimum } of getAccessibilityChecks(colors)) {
          if (ratio === null || ratio < minimum) {
            failures.push(`${file}:${mode}:${pair}:${ratio ?? 'invalid'}`);
          }
        }
      }
    }

    expect(failures).toEqual([]);
  });

  it.each([
    ['css escape', makeDesign({ 'tokens.colors.light.primary': 'red;} body { display: none; } x {' })],
    ['style tag injection', makeDesign({ 'tokens.colors.light.background': '</style><script>alert(1)</script>' })],
    ['url() exfiltration', makeDesign({ 'tokens.colors.dark.foreground': 'url(https://evil.example/x)' })],
    ['@import', makeDesign({ 'tokens.typography.fontFamily.sans': 'a;} @import url("https://evil.example");' })],
    ['javascript scheme', makeDesign({ 'tokens.radius.default': '0; background:url(javascript:alert(1))' })],
    ['non-string token', makeDesign({ 'tokens.colors.light.primary': { toString: () => 'evil' } as unknown as string })],
    ['css escape via token key', makeDesign({ 'tokens.colors.light.a;} body{display:none}x{': 'red' })],
  ])('rejects hostile token value (%s) without mutating style or state', (_label, data) => {
    render(
      <DesignProvider>
        <ApplyButton data={data} />
      </DesignProvider>,
    );
    fireEvent.click(screen.getByText('apply'));
    expect(getAppliedStyle()).toBeNull();
    expect(localStorage.getItem('sleek-ui:applied-design')).toBeNull();
    expect(localStorage.getItem('sleek-ui:applied-design:css')).toBeNull();
  });

  it('drops font URLs from non-Google hosts while keeping allowed hosts', () => {
    const data = makeDesign({
      'fonts.urls': [
        { url: 'https://evil.example/steal.css', format: 'css', family: 'Evil' },
        { url: 'https://fonts.gstatic.com/s/inter.woff2', format: 'woff2', family: 'Inter' },
        { url: 'http://fonts.googleapis.com/insecure.css', format: 'css', family: 'Insecure' },
      ],
      'fonts.google': [],
    });
    render(
      <DesignProvider>
        <ApplyButton data={data} />
      </DesignProvider>,
    );
    fireEvent.click(screen.getByText('apply'));
    const links = Array.from(document.querySelectorAll<HTMLLinkElement>('link[data-sleek-font]'));
    expect(links).toHaveLength(1);
    expect(links[0].href).toContain('fonts.gstatic.com');
  });

  it('still builds the Google Fonts link for whitelisted families', () => {
    render(
      <DesignProvider>
        <ApplyButton data={baseDesign} />
      </DesignProvider>,
    );
    fireEvent.click(screen.getByText('apply'));
    const links = Array.from(document.querySelectorAll<HTMLLinkElement>('link[data-sleek-font]'));
    expect(links).toHaveLength(1);
    expect(links[0].href).toContain('https://fonts.googleapis.com/css2?family=Inter');
  });

  it('ignores malformed design JSON restored from localStorage instead of injecting it', () => {
    localStorage.setItem(
      'sleek-ui:applied-design',
      JSON.stringify({ slug: 'x', name: 'x', data: { tokens: { colors: { light: { primary: 'p;} body{}' } } } } }),
    );
    render(
      <DesignProvider>
        <div>app</div>
      </DesignProvider>,
    );
    expect(getAppliedStyle()).toBeNull();
  });

  it('rebuilds the stylesheet from validated stored data on mount', () => {
    localStorage.setItem(
      'sleek-ui:applied-design',
      JSON.stringify({ slug: 'test-slug', name: 'Test Design', data: baseDesign }),
    );
    render(
      <DesignProvider>
        <div>app</div>
      </DesignProvider>,
    );
    expect(getAppliedStyle()?.textContent).toContain('--background: 0 0% 100%;');
  });
});

describe('DesignContext blocked storage (#103)', () => {
  it('applies and resets a design without uncaught errors when localStorage.setItem throws', () => {
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });
    try {
      render(
        <DesignProvider>
          <ApplyButton data={baseDesign} />
          <ResetButton />
        </DesignProvider>,
      );
      act(() => {
        fireEvent.click(screen.getByText('apply'));
      });
      expect(getAppliedStyle()?.textContent).toContain('--background: 0 0% 100%;');
      act(() => {
        fireEvent.click(screen.getByText('reset'));
      });
      expect(getAppliedStyle()).toBeNull();
    } finally {
      setItemSpy.mockRestore();
    }
  });

  it('resets without uncaught errors when localStorage.removeItem throws', () => {
    const removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });
    try {
      render(
        <DesignProvider>
          <ApplyButton data={baseDesign} />
          <ResetButton />
        </DesignProvider>,
      );
      fireEvent.click(screen.getByText('apply'));
      act(() => {
        fireEvent.click(screen.getByText('reset'));
      });
      expect(getAppliedStyle()).toBeNull();
    } finally {
      removeItemSpy.mockRestore();
    }
  });
});

function AppliedSlug() {
  const { appliedDesign } = useDesign();
  return <div>{appliedDesign ? appliedDesign.slug : 'none'}</div>;
}

describe('DesignContext characterization (#119)', () => {
  it('removes injected font links together with the stylesheet on reset', () => {
    render(
      <DesignProvider>
        <ApplyButton data={baseDesign} />
        <ResetButton />
      </DesignProvider>,
    );
    fireEvent.click(screen.getByText('apply'));
    expect(document.querySelectorAll('link[data-sleek-font]').length).toBeGreaterThan(0);
    fireEvent.click(screen.getByText('reset'));
    expect(document.querySelectorAll('link[data-sleek-font]')).toHaveLength(0);
    expect(getAppliedStyle()).toBeNull();
  });

  it('clears stored entries on reset so no design survives a reload simulation', () => {
    const view = render(
      <DesignProvider>
        <ApplyButton data={baseDesign} />
        <ResetButton />
        <AppliedSlug />
      </DesignProvider>,
    );
    fireEvent.click(screen.getByText('apply'));
    expect(JSON.parse(localStorage.getItem('sleek-ui:applied-design')!)).toMatchObject({
      slug: 'test-slug',
    });
    fireEvent.click(screen.getByText('reset'));
    view.unmount();

    render(
      <DesignProvider>
        <AppliedSlug />
      </DesignProvider>,
    );
    expect(screen.getByText('none')).toBeInTheDocument();
    expect(getAppliedStyle()).toBeNull();
  });

  it('keeps the applied slug visible after a reload simulation', () => {
    const view = render(
      <DesignProvider>
        <ApplyButton data={baseDesign} />
        <AppliedSlug />
      </DesignProvider>,
    );
    fireEvent.click(screen.getByText('apply'));
    expect(screen.getByText('test-slug')).toBeInTheDocument();
    view.unmount();

    render(
      <DesignProvider>
        <AppliedSlug />
      </DesignProvider>,
    );
    expect(screen.getByText('test-slug')).toBeInTheDocument();
  });

  it('throws a descriptive error when useDesign runs outside a DesignProvider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
      expect(() => render(<AppliedSlug />)).toThrow(
        'useDesign must be used within DesignProvider',
      );
    } finally {
      consoleError.mockRestore();
    }
  });
});

describe('Provider value stability (#137)', () => {
  it('does not re-render memoized consumers when the provider re-renders with an unchanged applied design', () => {
    let renders = 0;
    const Probe = memo(function Probe() {
      useDesign();
      renders += 1;
      return <span data-testid="probe" />;
    });

    const { rerender } = render(
      <DesignProvider>
        <span>unrelated sibling</span>
        <Probe />
      </DesignProvider>,
    );
    expect(renders).toBe(1);

    rerender(
      <DesignProvider>
        <span>another unrelated sibling</span>
        <Probe />
      </DesignProvider>,
    );
    expect(renders).toBe(1);
  });
});
