const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  createValidator,
  listDesignFiles,
  validateDesignFile,
  validateDesignsInDir
} = require('../scripts/validate-designs');

const SCHEMA_PATH = path.join(__dirname, '..', 'public', 'schema', 'design.v1.json');

describe('validate-designs', () => {
  let designsDir;

  beforeEach(() => {
    designsDir = fs.mkdtempSync(path.join(os.tmpdir(), 'designs-'));
  });

  afterEach(() => {
    fs.rmSync(designsDir, { recursive: true, force: true });
  });

  const writeFile = (name, content) =>
    fs.writeFileSync(path.join(designsDir, name), content);

  const stubValidate = (invalidFor = []) => (design) =>
    !invalidFor.includes(design.name);

  describe('listDesignFiles', () => {
    test('lists only .json files', () => {
      writeFile('a.json', '{}');
      writeFile('b.txt', 'nope');
      writeFile('c.json', '{}');
      expect(listDesignFiles(designsDir)).toEqual(['a.json', 'c.json']);
    });

    test('returns null for a missing directory', () => {
      expect(listDesignFiles(path.join(designsDir, 'nope'))).toBeNull();
    });
  });

  describe('validateDesignFile', () => {
    test('reports invalid JSON as an error instead of crashing', () => {
      writeFile('bad.json', '{ not json !!!');
      const result = validateDesignFile(path.join(designsDir, 'bad.json'), stubValidate());
      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toMatch(/invalid JSON/);
    });

    test('delegates well-formed files to the compiled validator', () => {
      writeFile('ok.json', '{"name":"ok"}');
      const validate = jest.fn(() => true);
      const result = validateDesignFile(path.join(designsDir, 'ok.json'), validate);
      expect(result.valid).toBe(true);
      expect(validate).toHaveBeenCalledWith({ name: 'ok' });
    });
  });

  describe('validateDesignsInDir', () => {
    test('one malformed file does not abort remaining files', () => {
      writeFile('aaa-bad.json', '{ broken');
      writeFile('bbb-good.json', '{"name":"bbb"}');
      writeFile('ccc-good.json', '{"name":"ccc"}');

      const logs = [];
      const { hasErrors } = validateDesignsInDir(designsDir, stubValidate(), (...m) => logs.push(m.join(' ')));

      expect(hasErrors).toBe(true);
      expect(logs.some(l => l.includes('✓ bbb-good.json'))).toBe(true);
      expect(logs.some(l => l.includes('✓ ccc-good.json'))).toBe(true);
      expect(logs.some(l => l.includes('✗ aaa-bad.json'))).toBe(true);
    });

    test('one schema-invalid file still validates remaining files', () => {
      writeFile('aaa-invalid.json', '{"name":"aaa-invalid"}');
      writeFile('bbb-valid.json', '{"name":"bbb-valid"}');

      const logs = [];
      const { hasErrors } = validateDesignsInDir(
        designsDir,
        stubValidate(['aaa-invalid']),
        (...m) => logs.push(m.join(' '))
      );

      expect(hasErrors).toBe(true);
      expect(logs.some(l => l.includes('✗ aaa-invalid.json'))).toBe(true);
      expect(logs.some(l => l.includes('✓ bbb-valid.json'))).toBe(true);
    });

    test('all-valid directory reports success (exit-code contract: 0)', () => {
      writeFile('a.json', '{"name":"a"}');
      writeFile('b.json', '{"name":"b"}');
      const { hasErrors } = validateDesignsInDir(designsDir, stubValidate(), () => {});
      expect(hasErrors).toBe(false);
    });

    test('empty directory reports success', () => {
      const { hasErrors } = validateDesignsInDir(designsDir, stubValidate(), () => {});
      expect(hasErrors).toBe(false);
    });

    test('missing directory reports failure', () => {
      const { hasErrors } = validateDesignsInDir(
        path.join(designsDir, 'missing'),
        stubValidate(),
        () => {}
      );
      expect(hasErrors).toBe(true);
    });
  });

  describe('createValidator (real schema)', () => {
    test('accepts an existing catalog design and rejects garbage', () => {
      const catalogDir = path.join(__dirname, '..', 'public', 'designs');
      const sample = fs.readdirSync(catalogDir).find(f => f.endsWith('.json'));
      const sampleJson = JSON.parse(fs.readFileSync(path.join(catalogDir, sample), 'utf8'));

      const validate = createValidator(SCHEMA_PATH);
      expect(validate(sampleJson)).toBe(true);
      expect(validate({ name: 'garbage' })).toBe(false);
    });
  });
});
