#!/usr/bin/env node
/**
 * Generate thumbnail SVGs for catalog designs.
 *
 * For every public/designs/{slug}.json without a matching
 * public/previews/{slug}-thumb.svg, renders a branded 400x300 SVG using the
 * design's own palette (background, foreground, primary, secondary).
 *
 * Usage:
 *   node scripts/generate-thumbnails.js           # generate missing thumbs only
 *   node scripts/generate-thumbnails.js --force   # regenerate all thumbs
 */

const fs = require('fs');
const path = require('path');

const DESIGNS_DIR = path.join(__dirname, '..', 'public', 'designs');
const PREVIEWS_DIR = path.join(__dirname, '..', 'public', 'previews');

const force = process.argv.includes('--force');

const cssColor = (value, fallback) => {
  if (!value || typeof value !== 'string') return fallback;
  const v = value.trim();
  // Tailwind-style HSL triplet, e.g. "349 100% 61%"
  if (/^[\d.]+\s+[\d.]+%\s+[\d.]+%$/.test(v)) {
    return `hsl(${v.split(/\s+/).join(', ')})`;
  }
  return v;
};

const esc = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function renderSvg({ name, modeLabel, bg, fg, muted, primary }) {
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">',
    `  <rect width="400" height="300" fill="${bg}"/>`,
    `  <text x="200" y="130" text-anchor="middle" fill="${fg}" font-family="Inter, sans-serif" font-size="18" font-weight="600">${esc(name)}</text>`,
    `  <text x="200" y="160" text-anchor="middle" fill="${muted}" font-family="Inter, sans-serif" font-size="12">${esc(modeLabel)} Preview</text>`,
    `  <rect x="100" y="180" width="200" height="40" rx="6" fill="${primary}"/>`,
    `  <text x="200" y="205" text-anchor="middle" fill="${bg}" font-family="Inter, sans-serif" font-size="14">Thumbnail</text>`,
    '</svg>',
    '',
  ].join('\n');
}

function main() {
  fs.mkdirSync(PREVIEWS_DIR, { recursive: true });

  const files = fs
    .readdirSync(DESIGNS_DIR)
    .filter((f) => f.endsWith('.json'))
    .sort();

  let created = 0;
  let skipped = 0;

  for (const file of files) {
    const slug = file.replace(/\.json$/, '');
    const outPath = path.join(PREVIEWS_DIR, `${slug}-thumb.svg`);

    if (!force && fs.existsSync(outPath)) {
      skipped++;
      continue;
    }

    const design = JSON.parse(
      fs.readFileSync(path.join(DESIGNS_DIR, file), 'utf8')
    );
    const mode = design.defaultMode || 'light';
    const modeColors =
      design.tokens?.colors?.[mode] || design.tokens?.colors?.light || {};

    const svg = renderSvg({
      name: design.name || slug,
      modeLabel: mode === 'dark' ? 'Dark Mode' : 'Light Mode',
      bg: cssColor(modeColors.background, '#ffffff'),
      fg: cssColor(modeColors.foreground, '#111111'),
      muted: cssColor(modeColors['muted-foreground'], cssColor(modeColors.muted, '#888888')),
      primary: cssColor(modeColors.primary, '#4f46e5'),
    });

    fs.writeFileSync(outPath, svg);
    created++;
  }

  console.log(
    `thumbnails: ${created} generated, ${skipped} skipped (${files.length} designs total)`
  );
}

main();
