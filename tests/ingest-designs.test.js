const { EventEmitter } = require('events');
const {
  fetchRawFile,
  parseDesignMd,
  expandHexShorthand,
  hexToHsl,
  extractColorsFromSection,
  getHslLightness,
  convertToSleekUi
} = require('../scripts/ingest-designs');

function makeTransport({ statusCode = 200, body = '', requestError = null } = {}) {
  return (url, onResponse) => {
    const req = new EventEmitter();
    req.setTimeout = () => {};
    process.nextTick(() => {
      if (requestError) {
        req.emit('error', requestError);
        return;
      }
      const res = new EventEmitter();
      res.statusCode = statusCode;
      res.resume = () => {};
      res.setEncoding = () => {};
      onResponse(res);
      if (statusCode !== 200) return;
      process.nextTick(() => {
        res.emit('data', body);
        res.emit('end');
      });
    });
    return req;
  };
}

const FIXTURE_DESIGN_MD = `# Test Design

## 1. Visual Theme & Atmosphere

A clean, minimal theme for testing.

## 2. Color Palette & Roles

- **Brand Green** (\`#22c55e\`): primary actions
- **Near Black** (\`#0a0a0a\`): heading text
- **Pure White** (\`#fff\`): page background
`;

describe('ingest-designs helpers', () => {
  describe('fetchRawFile', () => {
    test('resolves with body on status 200', async () => {
      await expect(
        fetchRawFile('https://example.com/x.md', makeTransport({ body: 'hello' }))
      ).resolves.toBe('hello');
    });

    test('rejects on non-200 status codes instead of resolving garbage', async () => {
      await expect(
        fetchRawFile('https://example.com/missing.md', makeTransport({ statusCode: 404 }))
      ).rejects.toThrow(/status code 404/);
    });

    test('rejects cleanly on socket/request errors', async () => {
      await expect(
        fetchRawFile(
          'https://example.com/x.md',
          makeTransport({ requestError: new Error('ECONNRESET') })
        )
      ).rejects.toThrow('ECONNRESET');
    });
  });

  describe('parseDesignMd', () => {
    test('splits content into sections', () => {
      const sections = parseDesignMd(FIXTURE_DESIGN_MD);
      expect(Object.keys(sections)).toEqual([
        '1. Visual Theme & Atmosphere',
        '2. Color Palette & Roles'
      ]);
      expect(sections['2. Color Palette & Roles']).toContain('Brand Green');
    });

    test('returns empty sections for content without headings', () => {
      expect(parseDesignMd('plain text\nno headings here')).toEqual({});
    });
  });

  describe('expandHexShorthand / hexToHsl', () => {
    test.each([
      ['#fff', '#ffffff'],
      ['abc', 'aabbcc'],
      ['#0a0a0a', '#0a0a0a']
    ])('expands %s to %s', (input, expected) => {
      expect(expandHexShorthand(input)).toBe(expected);
    });

    test('converts shorthand hex to HSL', () => {
      expect(hexToHsl('#fff')).toBe('0 0% 100%');
    });

    test('converts full hex to HSL', () => {
      expect(hexToHsl('#000000')).toBe('0 0% 0%');
    });

    test('passes through non-hex input unchanged', () => {
      expect(hexToHsl('245 90% 73%')).toBe('245 90% 73%');
    });
  });

  describe('extractColorsFromSection', () => {
    test('extracts both 3-digit and 6-digit hex colors', () => {
      const colors = extractColorsFromSection(FIXTURE_DESIGN_MD.split('\n').slice(6).join('\n'));
      expect(colors['brand green']).toBe(hexToHsl('#22c55e'));
      expect(colors['pure white']).toBe('0 0% 100%');
    });
  });

  describe('getHslLightness', () => {
    test.each([
      ['240 4.8% 95.9%', 95.9],
      ['0 84.2% 60.2%', 60.2],
      ['240 10% 8%', 8],
      ['not hsl at all', 50]
    ])('parses %s -> %s', (input, expected) => {
      expect(getHslLightness(input)).toBe(expected);
    });

    test("fractional lightness '95.9%' parses as 95.9, not a digit suffix", () => {
      expect(getHslLightness('0 0% 95.9%')).not.toBe(9);
      expect(getHslLightness('0 0% 95.9%')).toBe(95.9);
    });
  });

  describe('convertToSleekUi', () => {
    test('happy path builds a full design object from fixture markdown', () => {
      const design = convertToSleekUi(FIXTURE_DESIGN_MD, 'test-design', 'Test Design', 'design');

      expect(design.name).toBe('test-design');
      expect(design.categories).toContain('design');
      expect(design.tokens.colors.light.primary).toBe(hexToHsl('#22c55e'));
      expect(design.tokens.colors.light.background).toBe('0 0% 100%');
      expect(design.tokens.colors.dark.background).toBe(hexToHsl('#0a0a0a'));
      expect(design.tokens.colors.light.foreground).toBe(hexToHsl('#0a0a0a'));
      expect(design.source.path).toBe('design-md/test-design/DESIGN.md');
    });

    test('rejects empty content', () => {
      expect(() => convertToSleekUi('', 'x', 'X', 'design')).toThrow(/empty/);
      expect(() => convertToSleekUi(null, 'x', 'X', 'design')).toThrow(/empty/);
    });

    test('rejects malformed markdown with no sections', () => {
      expect(() => convertToSleekUi('random text\nwithout any headings\n', 'x', 'X', 'design'))
        .toThrow(/no '## ' sections found/);
    });

    test('falls back to default tokens when palette is missing', () => {
      const md = '## 1. Visual Theme & Atmosphere\n\nOnly a theme.\n';
      const design = convertToSleekUi(md, 'bare', 'Bare', 'design');
      expect(design.tokens.colors.light.primary).toBe('245 90% 73%');
      expect(design.tokens.colors.dark.background).toBe('240 10% 8%');
      expect(design.tokens.colors.light.background).toBe('0 0% 100%');
    });
  });
});
