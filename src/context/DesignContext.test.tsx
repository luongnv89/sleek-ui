import { render, screen, fireEvent, act } from '@testing-library/react';
import { DesignProvider, useDesign } from './DesignContext';
import type { DesignData } from '@/types/design';

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

function ApplyButton({ data }: { data: DesignData }) {
  const { applyDesign } = useDesign();
  return <button onClick={() => applyDesign('test-slug', 'Test Design', data)}>apply</button>;
}

function ResetButton() {
  const { resetDesign } = useDesign();
  return <button onClick={resetDesign}>reset</button>;
}

function getAppliedStyle(): HTMLElement | null {
  return document.getElementById('sleek-applied-design');
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
    expect(css).toContain('--primary: 245 90% 73%;');
    expect(css).toContain('--radius: 0.5rem;');
    expect(css).toContain('--font-sans: Inter, sans-serif;');
    expect(css).toContain('.dark {');
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
