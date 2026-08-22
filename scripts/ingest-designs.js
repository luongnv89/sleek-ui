#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

const REPO_OWNER = 'VoltAgent';
const REPO_NAME = 'awesome-design-md';
const DESIGNS_DIR = path.join(__dirname, '..', 'public', 'designs');

const DESIGN_MD_LIST = [
  { slug: 'airbnb', name: 'Airbnb', category: 'enterprise' },
  { slug: 'airtable', name: 'Airtable', category: 'productivity' },
  { slug: 'apple', name: 'Apple', category: 'enterprise' },
  { slug: 'bmw', name: 'BMW', category: 'enterprise' },
  { slug: 'cal', name: 'Cal.com', category: 'productivity' },
  { slug: 'claude', name: 'Claude', category: 'ai' },
  { slug: 'clay', name: 'Clay', category: 'design' },
  { slug: 'clickhouse', name: 'ClickHouse', category: 'infrastructure' },
  { slug: 'cohere', name: 'Cohere', category: 'ai' },
  { slug: 'coinbase', name: 'Coinbase', category: 'fintech' },
  { slug: 'composio', name: 'Composio', category: 'infrastructure' },
  { slug: 'cursor', name: 'Cursor', category: 'developer-tools' },
  { slug: 'elevenlabs', name: 'ElevenLabs', category: 'ai' },
  { slug: 'expo', name: 'Expo', category: 'developer-tools' },
  { slug: 'figma', name: 'Figma', category: 'design' },
  { slug: 'framer', name: 'Framer', category: 'design' },
  { slug: 'hashicorp', name: 'HashiCorp', category: 'infrastructure' },
  { slug: 'ibm', name: 'IBM', category: 'enterprise' },
  { slug: 'intercom', name: 'Intercom', category: 'productivity' },
  { slug: 'kraken', name: 'Kraken', category: 'fintech' },
  { slug: 'linear.app', name: 'Linear', category: 'developer-tools' },
  { slug: 'lovable', name: 'Lovable', category: 'developer-tools' },
  { slug: 'minimax', name: 'Minimax', category: 'ai' },
  { slug: 'mintlify', name: 'Mintlify', category: 'developer-tools' },
  { slug: 'miro', name: 'Miro', category: 'design' },
  { slug: 'mistral.ai', name: 'Mistral AI', category: 'ai' },
  { slug: 'mongodb', name: 'MongoDB', category: 'infrastructure' },
  { slug: 'notion', name: 'Notion', category: 'productivity' },
  { slug: 'nvidia', name: 'NVIDIA', category: 'enterprise' },
  { slug: 'ollama', name: 'Ollama', category: 'ai' },
  { slug: 'opencode.ai', name: 'OpenCode AI', category: 'ai' },
  { slug: 'pinterest', name: 'Pinterest', category: 'enterprise' },
  { slug: 'posthog', name: 'PostHog', category: 'developer-tools' },
  { slug: 'raycast', name: 'Raycast', category: 'developer-tools' },
  { slug: 'replicate', name: 'Replicate', category: 'ai' },
  { slug: 'resend', name: 'Resend', category: 'developer-tools' },
  { slug: 'revolut', name: 'Revolut', category: 'fintech' },
  { slug: 'runwayml', name: 'RunwayML', category: 'ai' },
  { slug: 'sanity', name: 'Sanity', category: 'infrastructure' },
  { slug: 'sentry', name: 'Sentry', category: 'developer-tools' },
  { slug: 'spacex', name: 'SpaceX', category: 'enterprise' },
  { slug: 'spotify', name: 'Spotify', category: 'enterprise' },
  { slug: 'stripe', name: 'Stripe', category: 'fintech' },
  { slug: 'supabase', name: 'Supabase', category: 'infrastructure' },
  { slug: 'superhuman', name: 'Superhuman', category: 'developer-tools' },
  { slug: 'together.ai', name: 'Together AI', category: 'ai' },
  { slug: 'uber', name: 'Uber', category: 'enterprise' },
  { slug: 'vercel', name: 'Vercel', category: 'developer-tools' },
  { slug: 'voltagent', name: 'VoltAgent', category: 'developer-tools' },
  { slug: 'warp', name: 'Warp', category: 'developer-tools' },
  { slug: 'webflow', name: 'Webflow', category: 'design' },
  { slug: 'wise', name: 'Wise', category: 'fintech' },
  { slug: 'x.ai', name: 'xAI', category: 'ai' },
  { slug: 'zapier', name: 'Zapier', category: 'developer-tools' },
];

const FETCH_TIMEOUT_MS = 30000;
const FETCH_CONCURRENCY = 8;

// Runs `worker` over `items` with at most `limit` promises in flight.
// Resolves with results in input order; rejections must be handled by the
// worker so one failure never abandons its siblings (Promise.allSettled-style).
function mapWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let next = 0;

  async function runQueue() {
    while (next < items.length) {
      const index = next++;
      results[index] = await worker(items[index], index);
    }
  }

  return Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => runQueue())
  ).then(() => results);
}

function fetchRawFile(url, httpsGet = https.get.bind(https)) {
  return new Promise((resolve, reject) => {
    const req = httpsGet(url, (res) => {
      if (res.statusCode !== 200) {
        res.resume();
        reject(new Error(`Request failed with status code ${res.statusCode}: ${url}`));
        return;
      }
      let data = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    });
    req.setTimeout(FETCH_TIMEOUT_MS, () => {
      req.destroy(new Error(`Request timed out after ${FETCH_TIMEOUT_MS}ms: ${url}`));
    });
    req.on('error', reject);
  });
}

function parseDesignMd(content) {
  const lines = content.split('\n');
  let currentSection = '';
  let sectionContent = [];

  const sections = {};

  for (const line of lines) {
    if (line.startsWith('## ')) {
      if (currentSection && sectionContent.length) {
        sections[currentSection] = sectionContent.join('\n').trim();
      }
      currentSection = line.replace(/^## /, '').trim();
      sectionContent = [];
    } else {
      sectionContent.push(line);
    }
  }
  if (currentSection && sectionContent.length) {
    sections[currentSection] = sectionContent.join('\n').trim();
  }

  return sections;
}

function expandHexShorthand(hex) {
  return hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (match, r, g, b) => {
    const prefix = match.startsWith('#') ? '#' : '';
    return `${prefix}${r}${r}${g}${g}${b}${b}`;
  });
}

function hexToHsl(hex) {
  const expanded = expandHexShorthand(hex);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(expanded);
  if (!result) return hex;

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function extractColorsFromSection(section) {
  if (!section) return {};
  // Format: - **Color Name** (`#hexcode`): description
  const colorRegex = /\*\*([^*]+)\*\*\s*\(`#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})`\)/g;
  const colors = {};
  let match;

  while ((match = colorRegex.exec(section)) !== null) {
    const name = match[1].trim().toLowerCase();
    const hex = match[2];
    colors[name] = hexToHsl(hex);
  }

  return colors;
}

function pickColor(colors, ...keywords) {
  for (const kw of keywords) {
    const match = Object.keys(colors).find(k => k.includes(kw));
    if (match) return colors[match];
  }
  return null;
}

function getHslLightness(hslStr) {
  const m = hslStr.match(/(\d+(?:\.\d+)?)%\s*$/);
  return m ? parseFloat(m[1]) : 50;
}

// Pure: reads `colors` without mutating it; sorts operate on fresh copies.
function pickThemeColors(colors) {
  const values = Object.values(colors);
  const darkest = [...values].sort((a, b) => getHslLightness(a) - getHslLightness(b))[0];
  const lightest = [...values].sort((a, b) => getHslLightness(b) - getHslLightness(a))[0];

  return {
    primary:
      pickColor(colors, 'brand', 'primary', 'accent', 'green', 'red', 'blue', 'purple', 'orange') ||
      values[0] ||
      '245 90% 73%',
    darkBg:
      pickColor(colors, 'black', 'near black', 'darkest', 'dark surface', 'background') ||
      darkest ||
      '240 10% 8%',
    lightBg:
      pickColor(colors, 'white', 'pure white', 'light surface', 'light background') ||
      lightest ||
      '0 0% 100%',
    fg:
      pickColor(colors, 'near black', 'heading', 'primary text', 'foreground', 'body') ||
      '240 10% 3.9%'
  };
}

function buildColorTokens({ primary, darkBg, lightBg, fg }) {
  return {
    light: {
      background: lightBg,
      foreground: fg,
      muted: '240 4.8% 95.9%',
      'muted-foreground': '240 3.8% 46.1%',
      primary,
      'primary-foreground': '0 0% 100%',
      secondary: '240 4.8% 95.9%',
      'secondary-foreground': '240 10% 3.9%',
      accent: '240 4.8% 95.9%',
      'accent-foreground': '240 10% 3.9%',
      destructive: '0 84.2% 60.2%',
      'destructive-foreground': '0 0% 100%',
      border: '240 5.9% 90%',
      input: '240 5.9% 90%',
      ring: primary,
      card: '0 0% 100%',
      'card-foreground': '240 10% 3.9%'
    },
    dark: {
      background: darkBg,
      foreground: '0 0% 95%',
      muted: '240 33% 19%',
      'muted-foreground': '240 5% 64.9%',
      primary,
      'primary-foreground': '0 0% 100%',
      secondary: '240 33% 19%',
      'secondary-foreground': '0 0% 95%',
      accent: '240 33% 19%',
      'accent-foreground': '0 0% 95%',
      destructive: '0 62.8% 30.6%',
      'destructive-foreground': '0 0% 100%',
      border: '240 33% 22%',
      input: '240 33% 22%',
      ring: primary,
      card: '240 33% 17%',
      'card-foreground': '0 0% 95%'
    }
  };
}

function buildTypographyTokens() {
  return {
    fontFamily: {
      sans: 'Inter',
      serif: 'Georgia',
      mono: 'JetBrains Mono'
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem'
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.625'
    },
    letterSpacing: {
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em'
    }
  };
}

function buildSpaceTokens() {
  return {
    spacing: {
      unit: '8px',
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
      '2xl': '48px'
    },
    radius: {
      sm: '0.125rem',
      default: '0.375rem',
      lg: '0.5rem',
      full: '9999px'
    },
    shadows: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      default: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
    }
  };
}

function buildTokens(themeColors) {
  return {
    colors: buildColorTokens(themeColors),
    typography: buildTypographyTokens(),
    ...buildSpaceTokens()
  };
}

function buildFonts() {
  return {
    google: [
      { family: 'Inter', weights: [400, 500, 600, 700] }
    ],
    urls: [
      {
        url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
        format: 'css2',
        family: 'Inter'
      }
    ]
  };
}

function buildAccessibility() {
  return {
    contrastTarget: 4.5,
    focusRing: {
      width: '2px',
      color: 'currentColor',
      offset: '2px'
    },
    reducedMotion: true
  };
}

function buildComponentTokens() {
  return {
    button: {
      primary: {
        background: 'primary',
        color: 'primary-foreground',
        borderRadius: 'radius.default',
        padding: 'spacing.sm spacing.md',
        fontWeight: 'semibold'
      },
      secondary: {
        background: 'secondary',
        color: 'secondary-foreground',
        borderRadius: 'radius.default',
        padding: 'spacing.sm spacing.md',
        fontWeight: 'medium'
      },
      ghost: {
        background: 'transparent',
        color: 'foreground',
        borderRadius: 'radius.default',
        padding: 'spacing.sm spacing.md',
        fontWeight: 'medium'
      }
    },
    card: {
      background: 'card',
      color: 'card-foreground',
      borderRadius: 'radius.lg',
      padding: 'spacing.lg',
      shadow: 'shadows.default',
      border: '1px solid border'
    },
    input: {
      background: 'background',
      color: 'foreground',
      borderRadius: 'radius.default',
      padding: 'spacing.sm spacing.md',
      border: '1px solid input',
      focusRing: 'focusRing',
      placeholderColor: 'muted-foreground'
    }
  };
}

function buildAgentInstructions() {
  return {
    defaultMode: 'dark',
    steps: [
      `Set CSS custom properties from tokens.colors on :root (light) and .dark (dark mode)`,
      'Set --radius from tokens.radius.default',
      'Load fonts by adding the Google Fonts URL from fonts.urls as a <link> tag',
      'Set font-family from tokens.typography.fontFamily',
      'Apply component styles from the components field',
      'Ensure focus states match accessibility.focusRing specification',
      'Test both light and dark modes'
    ]
  };
}

function buildPreview(slug) {
  return {
    thumbnail: `/previews/${slug}-thumb.svg`,
    screenshots: {
      light: [`/previews/${slug}-light.svg`],
      dark: [`/previews/${slug}-dark.svg`]
    }
  };
}

function buildSource(slug, importedAt) {
  return {
    repo: `https://github.com/${REPO_OWNER}/${REPO_NAME}`,
    path: `design-md/${slug}/DESIGN.md`,
    importedAt
  };
}

// Pure template builder: assembles the design object from already-picked values.
function buildSleekUiTemplate({ slug, name, category, theme, themeColors, importedAt }) {
  const design = {
    $schema: 'https://luongnv.com/sleek-ui/schema/design.v1.json',
    name: slug,
    version: '1.0.0',
    description: theme.slice(0, 200) || `${name} design system for AI agents`,
    categories: [category, 'dark'],
    author: {
      name: 'VoltAgent',
      url: 'https://github.com/VoltAgent/awesome-design-md'
    },
    tokens: buildTokens(themeColors),
    fonts: buildFonts(),
    accessibility: buildAccessibility(),
    components: buildComponentTokens(),
    agentInstructions: buildAgentInstructions(),
    preview: buildPreview(slug),
    source: buildSource(slug, importedAt)
  };

  return design;
}

function convertToSleekUi(designMdContent, slug, name, category) {
  if (typeof designMdContent !== 'string' || !designMdContent.trim()) {
    throw new Error(`Malformed DESIGN.md for '${slug}': content is empty`);
  }
  const sections = parseDesignMd(designMdContent);
  if (Object.keys(sections).length === 0) {
    throw new Error(`Malformed DESIGN.md for '${slug}': no '## ' sections found`);
  }
  const colorSection = sections['2. Color Palette & Roles'] || '';
  const colors = extractColorsFromSection(colorSection);
  const theme = sections['1. Visual Theme & Atmosphere'] || '';
  const themeColors = pickThemeColors(colors);

  return buildSleekUiTemplate({
    slug,
    name,
    category,
    theme,
    themeColors,
    importedAt: new Date().toISOString()
  });
}

async function ingestDesigns({
  designs = DESIGN_MD_LIST,
  designsDir = DESIGNS_DIR,
  transport = https.get.bind(https),
  concurrency = FETCH_CONCURRENCY,
  log = console.log
} = {}) {
  log(`Fetching ${designs.length} designs from VoltAgent/awesome-design-md...\n`);

  if (!fs.existsSync(designsDir)) {
    fs.mkdirSync(designsDir, { recursive: true });
  }

  let imported = 0;
  let failed = 0;
  const errors = [];

  await mapWithConcurrency(designs, concurrency, async (design) => {
    const url = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/design-md/${design.slug}/DESIGN.md`;

    try {
      const content = await fetchRawFile(url, transport);

      const sleekDesign = convertToSleekUi(content, design.slug, design.name, design.category);

      const outputPath = path.join(designsDir, `${design.slug}.json`);
      fs.writeFileSync(outputPath, JSON.stringify(sleekDesign, null, 2));

      log(`✓ ${design.name}`);
      imported++;
    } catch (err) {
      log(`✗ ${design.name}: ${err.message}`);
      errors.push({ name: design.name, error: err.message });
      failed++;
    }
  });

  log('\n---');
  log(`Imported: ${imported}/${designs.length}`);
  log(`Output: ${designsDir}`);

  if (errors.length > 0) {
    log('\nFailed:');
    errors.forEach(e => log(`  - ${e.name}: ${e.error}`));
  }

  return { imported, failed, errors };
}

async function main() {
  return ingestDesigns();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  DESIGN_MD_LIST,
  FETCH_CONCURRENCY,
  fetchRawFile,
  mapWithConcurrency,
  ingestDesigns,
  parseDesignMd,
  expandHexShorthand,
  hexToHsl,
  extractColorsFromSection,
  pickColor,
  getHslLightness,
  pickThemeColors,
  buildColorTokens,
  convertToSleekUi
};
