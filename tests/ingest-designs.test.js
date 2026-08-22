const { EventEmitter } = require('events');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  DESIGN_MD_LIST,
  FETCH_CONCURRENCY,
  fetchRawFile,
  mapWithConcurrency,
  ingestDesigns,
  parseDesignMd,
  expandHexShorthand,
  hexToHsl,
  extractColorsFromSection,
  getHslLightness,
  pickThemeColors,
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

// Instrumented transport: records when each request starts and defers its
// response until `gate` resolves, so tests can observe overlapping requests.
function makeInstrumentedTransport(state, { gate = Promise.resolve(), body = FIXTURE_DESIGN_MD } = {}) {
  return (url, onResponse) => {
    state.started.push(url);
    state.active = (state.active || 0) + 1;
    state.maxConcurrent = Math.max(state.maxConcurrent || 0, state.active);
    const req = new EventEmitter();
    req.setTimeout = () => {};
    process.nextTick(async () => {
      await gate;
      const res = new EventEmitter();
      res.statusCode = 200;
      res.resume = () => {};
      res.setEncoding = () => {};
      onResponse(res);
      process.nextTick(() => {
        res.emit('data', body);
        state.active--;
        res.emit('end');
      });
    });
    return req;
  };
}

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

  describe('mapWithConcurrency', () => {
    test('returns results in input order', async () => {
      const results = await mapWithConcurrency([3, 1, 2], 2, async (n) => {
        await new Promise((r) => setTimeout(r, 4 - n));
        return n * 10;
      });
      expect(results).toEqual([30, 10, 20]);
    });

    test('never exceeds the concurrency cap', async () => {
      let inFlight = 0;
      let peak = 0;
      const items = Array.from({ length: 20 }, (_, i) => i);

      await mapWithConcurrency(items, FETCH_CONCURRENCY, async () => {
        inFlight++;
        peak = Math.max(peak, inFlight);
        await new Promise((r) => setTimeout(r, 1));
        inFlight--;
      });

      expect(peak).toBeLessThanOrEqual(FETCH_CONCURRENCY);
    });

    test('handles an empty list without spawning workers', async () => {
      const worker = jest.fn();
      await expect(mapWithConcurrency([], 8, worker)).resolves.toEqual([]);
      expect(worker).not.toHaveBeenCalled();
    });
  });

  describe('ingestDesigns', () => {
    function makeDesigns(n) {
      return Array.from({ length: n }, (_, i) => ({
        slug: `design-${i}`,
        name: `Design ${i}`,
        category: 'design'
      }));
    }

    function makeTmpDir() {
      return fs.mkdtempSync(path.join(os.tmpdir(), 'ingest-test-'));
    }

    test('fetches with overlapping requests capped at FETCH_CONCURRENCY', async () => {
      const designs = makeDesigns(24);
      const state = { started: [], startTimes: [] };
      // Hold every response until all cap-many requests have been started,
      // proving requests overlap rather than run serially.
      let release;
      const gate = new Promise((resolve) => { release = resolve; });
      const transport = makeInstrumentedTransport(state, { gate });
      const dir = makeTmpDir();

      const done = ingestDesigns({ designs, designsDir: dir, transport, log: () => {} });
      await new Promise((r) => setTimeout(r, 10));
      expect(state.started).toHaveLength(FETCH_CONCURRENCY); // first wave in flight
      release();
      const result = await done;

      expect(state.started).toHaveLength(designs.length);
      expect(result.imported).toBe(designs.length);
      expect(result.failed).toBe(0);
      expect(state.maxConcurrent).toBe(FETCH_CONCURRENCY); // requests overlapped

      for (const design of designs) {
        expect(fs.existsSync(path.join(dir, `${design.slug}.json`))).toBe(true);
      }
    });

    test('one failing file neither aborts siblings nor writes garbage', async () => {
      const designs = [...makeDesigns(4), { slug: 'bad', name: 'Bad', category: 'design' }];
      const state = { started: [], startTimes: [] };
      const transport = (url, onResponse) => {
        if (url.includes('/bad/')) {
          const req = new EventEmitter();
          req.setTimeout = () => {};
          process.nextTick(() => {
            const res = new EventEmitter();
            res.statusCode = 404;
            res.resume = () => {};
            onResponse(res);
          });
          return req;
        }
        return makeInstrumentedTransport(state)(url, onResponse);
      };
      const dir = makeTmpDir();

      const result = await ingestDesigns({ designs, designsDir: dir, transport, log: () => {} });

      expect(result.failed).toBe(1);
      expect(result.errors).toEqual([
        { name: 'Bad', error: expect.stringContaining('status code 404') }
      ]);
      expect(result.imported).toBe(4);
      for (const design of designs.filter((d) => d.slug !== 'bad')) {
        const file = path.join(dir, `${design.slug}.json`);
        expect(fs.existsSync(file)).toBe(true);
        expect(JSON.parse(fs.readFileSync(file, 'utf8')).name).toBe(design.slug);
      }
      expect(fs.existsSync(path.join(dir, 'bad.json'))).toBe(false);
    });

    test('writes to a real directory without touching public/designs', async () => {
      const state = { started: [], startTimes: [] };
      const transport = makeInstrumentedTransport(state);
      const dir = makeTmpDir();

      const result = await ingestDesigns({
        designs: makeDesigns(2),
        designsDir: dir,
        transport,
        log: () => {}
      });

      expect(result.imported).toBe(2);
      expect(fs.readdirSync(dir)).toEqual(['design-0.json', 'design-1.json']);
    });
  });

  describe('pickThemeColors purity', () => {
    test('selects darkest/lightest via sorted copies without mutating its input', () => {
      const colors = {
        'sky blue': hexToHsl('#38bdf8'),
        'near black': hexToHsl('#0a0a0a'),
        'pure white': '0 0% 100%',
        'brand green': hexToHsl('#22c55e')
      };
      const snapshot = JSON.stringify(colors);

      const picked = pickThemeColors(colors);

      expect(picked.primary).toBe(hexToHsl('#22c55e'));
      expect(picked.darkBg).toBe(hexToHsl('#0a0a0a'));
      expect(picked.lightBg).toBe('0 0% 100%');
      expect(JSON.stringify(colors)).toBe(snapshot);
    });

    test('does not mutate a frozen colors object (no in-place sort)', () => {
      const colors = Object.freeze({
        'mid gray': '240 5% 65%',
        'deep navy': '222 47% 11%',
        'cream': '48 33% 97%'
      });

      expect(() => pickThemeColors(colors)).not.toThrow();
      const picked = pickThemeColors(colors);
      expect(picked.darkBg).toBe('222 47% 11%');
      expect(picked.lightBg).toBe('48 33% 97%');
      expect(Object.isFrozen(colors)).toBe(true);
    });

    test('falls back to defaults on an empty palette without throwing', () => {
      const picked = pickThemeColors({});
      expect(picked.primary).toBe('245 90% 73%');
      expect(picked.darkBg).toBe('240 10% 8%');
      expect(picked.lightBg).toBe('0 0% 100%');
      expect(picked.fg).toBe('240 10% 3.9%');
    });
  });
});
