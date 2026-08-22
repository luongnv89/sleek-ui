import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { DesignData, TransformedDesign } from '@/types/design';
import { safeSetItem, safeRemoveItem } from '@/lib/safeStorage';

const STORAGE_KEY = 'sleek-ui:applied-design';
const SAFE_TOKEN_VALUE = /^[A-Za-z0-9 _%.,'"#+/-]+$/;
const SAFE_TOKEN_KEY = /^[A-Za-z0-9_-]+$/;
export const ALLOWED_FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

interface AppliedDesign {
  slug: string;
  name: string;
}

interface StoredDesignEntry extends AppliedDesign {
  data: DesignData;
}

interface DesignContextValue {
  appliedDesign: AppliedDesign | null;
  applyDesign: (design: TransformedDesign) => void;
  resetDesign: () => void;
}

const DesignContext = createContext<DesignContextValue | null>(null);

function upsertStyle(id: string, css: string) {
  let el = document.getElementById(id) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement('style');
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = css;
}

function removeStyle(id: string) {
  document.getElementById(id)?.remove();
}

function isSafeTokenValue(value: unknown): value is string {
  return typeof value === 'string' && value.length <= 256 && SAFE_TOKEN_VALUE.test(value);
}

function isSafeColorScale(scale?: Record<string, string>): boolean {
  return Object.entries(scale ?? {}).every(([key, value]) => SAFE_TOKEN_KEY.test(key) && isSafeTokenValue(value));
}

export function isDesignSafe(data: unknown): data is DesignData {
  if (!data || typeof data !== 'object') return false;
  const tokens = (data as DesignData).tokens;
  if (!tokens || typeof tokens !== 'object') return false;
  if (!isSafeColorScale(tokens.colors?.light) || !isSafeColorScale(tokens.colors?.dark)) return false;
  if (tokens.radius?.default != null && !isSafeTokenValue(tokens.radius.default)) return false;
  const fontFamilies = [tokens.typography?.fontFamily?.sans, tokens.typography?.fontFamily?.mono];
  return fontFamilies.every(f => f == null || isSafeTokenValue(f));
}

function isAllowedFontUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && ALLOWED_FONT_HOSTS.includes(parsed.hostname);
  } catch {
    return false;
  }
}

function loadFonts(data: DesignData) {
  document.querySelectorAll('link[data-sleek-font]').forEach(el => el.remove());

  if (data.fonts?.urls?.length) {
    data.fonts.urls.forEach(({ url }) => {
      if (!url || !isAllowedFontUrl(url)) return;
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      link.dataset.sleekFont = 'true';
      document.head.appendChild(link);
    });
  } else if (data.fonts?.google?.length) {
    const families = data.fonts.google
      .filter(f => typeof f.family === 'string' && Array.isArray(f.weights) && f.weights.every(w => typeof w === 'number' && Number.isFinite(w)))
      .map(f => `family=${encodeURIComponent(f.family)}:wght@${f.weights.join(';')}`)
      .join('&');
    if (!families) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
    link.dataset.sleekFont = 'true';
    document.head.appendChild(link);
  }
}

function removeFonts() {
  document.querySelectorAll('link[data-sleek-font]').forEach(el => el.remove());
}

function buildCssVars(data: DesignData): string {
  const { colors, radius, typography } = data.tokens;

  const lightVars = Object.entries(colors.light || {})
    .map(([k, v]) => `  --${k}: ${v};`)
    .join('\n');

  const darkVars = Object.entries(colors.dark || {})
    .map(([k, v]) => `  --${k}: ${v};`)
    .join('\n');

  const radiusVal = radius?.default ?? '0.5rem';
  const fontSans = typography?.fontFamily?.sans ?? 'system-ui, sans-serif';
  const fontMono = typography?.fontFamily?.mono ?? 'monospace';

  return `
:root {
${lightVars}
  --radius: ${radiusVal};
  --font-sans: ${fontSans};
  --font-mono: ${fontMono};
}

.dark {
${darkVars}
  --radius: ${radiusVal};
  --font-sans: ${fontSans};
  --font-mono: ${fontMono};
}

body {
  font-family: ${fontSans};
}
`.trim();
}

export function DesignProvider({ children }: { children: ReactNode }) {
  const [appliedDesign, setAppliedDesign] = useState<AppliedDesign | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (!appliedDesign) return;
    let entry: StoredDesignEntry | null = null;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      entry = stored ? JSON.parse(stored) : null;
    } catch {
      entry = null;
    }
    if (entry && isDesignSafe(entry.data)) {
      upsertStyle('sleek-applied-design', buildCssVars(entry.data));
    }
  }, []);

  const applyDesign = useCallback((design: TransformedDesign) => {
    const data = design.rawData;
    if (!isDesignSafe(data)) return;
    const css = buildCssVars(data);
    upsertStyle('sleek-applied-design', css);
    loadFonts(data);

    const entry: AppliedDesign = { slug: design.slug, name: design.name };
    setAppliedDesign(entry);
    safeSetItem(STORAGE_KEY, JSON.stringify({ ...entry, data }));
    safeSetItem(STORAGE_KEY + ':css', css);
  }, []);

  const resetDesign = useCallback(() => {
    removeStyle('sleek-applied-design');
    removeFonts();
    setAppliedDesign(null);
    safeRemoveItem(STORAGE_KEY);
    safeRemoveItem(STORAGE_KEY + ':css');
  }, []);

  return (
    <DesignContext.Provider value={{ appliedDesign, applyDesign, resetDesign }}>
      {children}
    </DesignContext.Provider>
  );
}

export function useDesign() {
  const ctx = useContext(DesignContext);
  if (!ctx) throw new Error('useDesign must be used within DesignProvider');
  return ctx;
}
