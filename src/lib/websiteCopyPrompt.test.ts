import { buildWebsiteCopyPrompt, normalizeWebsiteUrl } from './websiteCopyPrompt';

const PROMPT_HEADLINE = 'Copy the design of the website at:';

describe('normalizeWebsiteUrl (#189)', () => {
  it('returns the serialized URL for valid input', () => {
    expect(normalizeWebsiteUrl('stripe.com')).toBe('https://stripe.com/');
    expect(normalizeWebsiteUrl('  https://linear.app/blog ')).toBe('https://linear.app/blog');
    expect(normalizeWebsiteUrl('http://localhost:3000')).toBe('http://localhost:3000/');
  });

  it('returns the URL exactly as parsed, without parser-stripped characters', () => {
    expect(normalizeWebsiteUrl('https://exa\tmple.com')).toBe('https://example.com/');
    expect(normalizeWebsiteUrl('https://example.com/\npath')).toBe('https://example.com/path');
  });

  it('returns null for empty or malformed input', () => {
    expect(normalizeWebsiteUrl('')).toBeNull();
    expect(normalizeWebsiteUrl('   ')).toBeNull();
    expect(normalizeWebsiteUrl('foo bar')).toBeNull();
    expect(normalizeWebsiteUrl('https://')).toBeNull();
  });

  it('returns null for non-web schemes', () => {
    expect(normalizeWebsiteUrl('ftp://example.com')).toBeNull();
    expect(normalizeWebsiteUrl('javascript://alert(1)')).toBeNull();
    expect(normalizeWebsiteUrl('file:///etc/passwd')).toBeNull();
  });
});

describe('buildWebsiteCopyPrompt (#189)', () => {
  it('embeds the given URL verbatim in the prompt headline', () => {
    const prompt = buildWebsiteCopyPrompt('https://stripe.com/');
    expect(prompt.split('\n')[0]).toBe(`${PROMPT_HEADLINE} https://stripe.com/`);
  });

  it('covers gated research, planning, and implementation phases', () => {
    const prompt = buildWebsiteCopyPrompt('https://example.com/');
    expect(prompt).toContain('PHASE 1 — RESEARCH');
    expect(prompt).toContain('PHASE 2 — PLANNING');
    expect(prompt).toContain('PHASE 3 — IMPLEMENTATION');
  });

  it('gates every numbered step on a report and explicit approval', () => {
    const prompt = buildWebsiteCopyPrompt('https://example.com/');
    const steps = prompt.match(/^\d+\. /gm) ?? [];
    const gates = prompt.match(/report .+ wait for my approval/gi) ?? [];
    expect(steps.length).toBeGreaterThanOrEqual(3);
    expect(gates.length).toBeGreaterThanOrEqual(steps.length);
    expect(prompt).toMatch(/wait for my approval before continuing/i);
  });

  it('asks for theme, style, and design details to be extracted and applied', () => {
    const prompt = buildWebsiteCopyPrompt('https://example.com/');
    expect(prompt).toMatch(/theme/i);
    expect(prompt).toMatch(/style/i);
    expect(prompt).toMatch(/design details/i);
    expect(prompt).toMatch(/extract/i);
    expect(prompt).toMatch(/apply/i);
  });

  it('lists the extraction taxonomy: colors, typography, spacing, radius, shadows', () => {
    const prompt = buildWebsiteCopyPrompt('https://example.com/');
    for (const token of ['background', 'foreground', 'primary', 'muted', 'accent', 'destructive', 'border', 'ring', 'card']) {
      expect(prompt).toContain(token);
    }
    expect(prompt).toMatch(/typography/i);
    expect(prompt).toMatch(/spacing/i);
    expect(prompt).toMatch(/radius/i);
    expect(prompt).toMatch(/shadow/i);
  });
});
