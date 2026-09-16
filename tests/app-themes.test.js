const { validateCollectionFields } = require('../scripts/validate-designs');
const {
  normalizePaletteColor,
  mapAppPaletteToTokens,
  mapAppPaletteToTokenColors,
  buildAppThemeTemplate,
  hexToHsl,
} = require('../scripts/ingest-designs');

describe('app theme collections (#181)', () => {
  describe('validateCollectionFields', () => {
    test('accepts web designs without collection fields', () => {
      expect(validateCollectionFields({ name: 'x' })).toEqual([]);
    });

    test('rejects unknown collection values', () => {
      const errors = validateCollectionFields({ collection: 'mobile' });
      expect(errors.some(e => e.message.includes('invalid collection'))).toBe(true);
    });

    test('rejects unknown and duplicated appTargets', () => {
      expect(
        validateCollectionFields({ collection: 'web', appTargets: ['sublime'] }).some(e =>
          e.message.includes('invalid appTarget'),
        ),
      ).toBe(true);
      expect(
        validateCollectionFields({ collection: 'web', appTargets: ['pi', 'pi'] }).some(e =>
          e.message.includes('unique'),
        ),
      ).toBe(true);
      expect(
        validateCollectionFields({ collection: 'web', appTargets: 'pi' }).some(e =>
          e.message.includes('must be an array'),
        ),
      ).toBe(true);
    });

    test('requires non-empty appTargets for terminal and coding', () => {
      expect(
        validateCollectionFields({ collection: 'terminal', appTargets: [] }).some(e =>
          e.message.includes('requires a non-empty appTargets'),
        ),
      ).toBe(true);
      expect(
        validateCollectionFields({ collection: 'coding' }).some(e =>
          e.message.includes('requires a non-empty appTargets'),
        ),
      ).toBe(true);
      expect(
        validateCollectionFields({ collection: 'terminal', appTargets: ['pi'] }),
      ).toEqual([]);
    });
  });

  describe('palette mapping', () => {
    test('converts hex palette entries to HSL', () => {
      expect(normalizePaletteColor('#bd93f9')).toBe(hexToHsl('#bd93f9'));
      expect(normalizePaletteColor('231 15% 18%')).toBe('231 15% 18%');
      expect(normalizePaletteColor(42)).toBe(42);
    });

    test('builds light+dark tokens from a pi-extensions palette', () => {
      const tokens = mapAppPaletteToTokens({
        background: '#282a36',
        foreground: '#f8f8f2',
        primary: '#bd93f9',
        comment: '#6272a4',
      });
      expect(tokens.colors.dark.background).toBe(hexToHsl('#282a36'));
      expect(tokens.colors.dark.primary).toBe(hexToHsl('#bd93f9'));
      expect(tokens.colors.light.background).toBe('0 0% 100%');
    });

    test('falls back to defaults on an empty palette', () => {
      const tokens = mapAppPaletteToTokens({});
      expect(tokens.colors.dark.background).toBe('231 15% 18%');
      expect(tokens.colors.dark.primary).toBe('265 89% 78%');
    });

    test('maps known scopes to a tokenColors array', () => {
      const colors = mapAppPaletteToTokenColors({ comment: '#6272a4', keyword: '#ff79c6' });
      expect(colors).toEqual([
        { scope: 'comment', color: hexToHsl('#6272a4') },
        { scope: 'keyword', color: hexToHsl('#ff79c6') },
      ]);
      expect(mapAppPaletteToTokenColors({})).toEqual([]);
    });

    test('builds a schema-shaped app theme template', () => {
      const theme = buildAppThemeTemplate({
        slug: 'terminal-pi-test',
        description: 'test theme',
        collection: 'terminal',
        appTargets: ['pi'],
        palette: { background: '#282a36', comment: '#6272a4' },
        source: { repo: 'https://example.com', path: 'themes/x.json', importedAt: '2026-01-01' },
      });
      expect(theme.collection).toBe('terminal');
      expect(theme.appTargets).toEqual(['pi']);
      expect(theme.tokenColors.some(t => t.scope === 'comment')).toBe(true);
      expect(theme.tokens.colors.dark).toBeDefined();
    });
  });
});
