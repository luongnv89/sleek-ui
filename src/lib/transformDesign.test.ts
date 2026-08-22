import { transformDesign } from './transformDesign';
import type { DesignData } from '../types/design';

const makeDesign = (overrides: Partial<DesignData> = {}): DesignData =>
  ({
    name: 'test-design',
    version: '1.0.0',
    description: 'A test design system',
    categories: ['test'],
    tokens: {
      colors: {
        light: {
          background: '0 0% 100%',
          foreground: '240 10% 3.9%',
          primary: '245 90% 73%',
          secondary: '240 4.8% 95.9%',
        },
        dark: {
          background: '240 10% 8%',
          foreground: '0 0% 95%',
          primary: '245 90% 73%',
          secondary: '240 33% 19%',
        },
      },
      typography: {
        fontFamily: { sans: 'Inter' },
      },
    },
    defaultMode: 'light',
    ...overrides,
  }) as DesignData;

describe('transformDesign', () => {
  it('maps slug and name from the design name field', () => {
    const result = transformDesign(makeDesign({ name: 'my-design' }));
    expect(result.slug).toBe('my-design');
    expect(result.name).toBe('my-design');
  });

  it('uses light mode colors by default', () => {
    const result = transformDesign(makeDesign());
    expect(result.colors.primary).toBe('245 90% 73%');
    expect(result.colors.secondary).toBe('240 4.8% 95.9%');
    expect(result.defaultMode).toBe('light');
  });

  it('falls back to light palette when defaultMode is dark but dark colors are absent', () => {
    const design = makeDesign({ defaultMode: 'dark' });
    delete (design.tokens!.colors as unknown as Record<string, unknown>).dark;
    const result = transformDesign(design);
    expect(result.defaultMode).toBe('dark');
    expect(result.colors.primary).toBe('245 90% 73%');
  });

  it('builds json and thumbnail URLs from the GitHub Pages base', () => {
    const result = transformDesign(makeDesign({ name: 'url-check' }));
    expect(result.jsonUrl).toBe(
      'https://luongnv.com/sleek-ui/designs/url-check.json'
    );
    expect(result.thumbnailUrl).toBe(
      'https://luongnv.com/sleek-ui/previews/url-check-thumb.svg'
    );
    expect(result.detailUrl).toBe('/designs/url-check');
  });

  it('prefers an explicit preview.thumbnail path over the generated one', () => {
    const result = transformDesign(
      makeDesign({
        preview: {
          thumbnail: '/previews/custom.svg',
          screenshots: {},
        },
      })
    );
    expect(result.thumbnailUrl).toBe(
      'https://luongnv.com/sleek-ui/previews/custom.svg'
    );
  });

  it('derives description from typography sans font family when present', () => {
    const result = transformDesign(makeDesign());
    expect(result.description).toBe('A Inter based design system');
  });

  it('falls back to a generic description without a sans font family', () => {
    const design = makeDesign();
    delete (design.tokens!.typography!.fontFamily as { sans?: string }).sans;
    const result = transformDesign(design);
    expect(result.description).toBe('A beautiful design system');
  });

  it('defaults categories to an empty list and keeps provided ones', () => {
    expect(transformDesign(makeDesign()).categories).toEqual(['test']);
    expect(transformDesign(makeDesign({ categories: undefined })).categories).toEqual([]);
  });

  it('returns empty color strings when tokens are missing entirely', () => {
    const design = makeDesign();
    (design as { tokens?: unknown }).tokens = undefined;
    const result = transformDesign(design);
    expect(result.colors).toEqual({ primary: '', secondary: '' });
  });

  it('keeps a reference to the raw design data', () => {
    const design = makeDesign();
    const result = transformDesign(design);
    expect(result.rawData).toBe(design);
  });
});
