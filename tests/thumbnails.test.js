/**
 * Regression guard for issue #143.
 *
 * Every catalog design must reference a thumbnail that actually ships in
 * public/previews/ — otherwise catalog cards render 404 images in production.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DESIGNS_DIR = path.join(ROOT, 'public', 'designs');
const PREVIEWS_DIR = path.join(ROOT, 'public', 'previews');

const listDesignSlugs = () =>
  fs
    .readdirSync(DESIGNS_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''))
    .sort();

describe('catalog thumbnails (#143)', () => {
  const slugs = listDesignSlugs();

  it('has a catalog to validate', () => {
    expect(slugs.length).toBeGreaterThanOrEqual(60);
  });

  it.each(slugs)('%s resolves its preview.thumbnail to an existing file', (slug) => {
    const design = JSON.parse(
      fs.readFileSync(path.join(DESIGNS_DIR, `${slug}.json`), 'utf8')
    );
    const thumbnail = design.preview?.thumbnail;

    expect(typeof thumbnail).toBe('string');
    expect(thumbnail).toMatch(/^\/previews\//);

    const onDisk = path.join(ROOT, 'public', thumbnail.replace(/^\//, ''));
    expect(fs.existsSync(onDisk)).toBe(true);
  });

  it('ships one thumb SVG per design slug', () => {
    for (const slug of slugs) {
      const thumbPath = path.join(PREVIEWS_DIR, `${slug}-thumb.svg`);
      expect(fs.existsSync(thumbPath)).toBe(true);
    }
  });
});

describe('release records (#143)', () => {
  const changelog = fs.readFileSync(
    path.join(ROOT, 'docs', 'CHANGELOG.md'),
    'utf8'
  );
  const release = fs.readFileSync(path.join(ROOT, 'RELEASE.md'), 'utf8');

  it('keeps docs/CHANGELOG.md as the single authoritative history', () => {
    const versionHeaders = changelog.match(/^## \[[^\]]+\]/gm) || [];
    const seen = new Set();
    for (const header of versionHeaders) {
      expect(seen.has(header)).toBe(false);
      seen.add(header);
    }
    expect(versionHeaders.length).toBeGreaterThan(0);
  });

  it('cross-links RELEASE.md to the changelog instead of duplicating records', () => {
    expect(release).toContain('docs/CHANGELOG.md');
  });

  it('documents post-v1.0.0 catalog growth', () => {
    expect(changelog).toMatch(/## \[Unreleased\]/);
  });
});
