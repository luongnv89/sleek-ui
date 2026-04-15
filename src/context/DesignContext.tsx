import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import type { DesignData } from '@/types/design';

const STORAGE_KEY = 'sleek-ui:applied-design';

interface AppliedDesign {
  slug: string;
  name: string;
}

interface DesignContextValue {
  appliedDesign: AppliedDesign | null;
  applyDesign: (slug: string, name: string, data: DesignData) => void;
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

function loadFonts(data: DesignData) {
  document.querySelectorAll('link[data-sleek-font]').forEach(el => el.remove());

  if (data.fonts?.urls?.length) {
    data.fonts.urls.forEach(({ url }) => {
      if (!url) return;
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      link.dataset.sleekFont = 'true';
      document.head.appendChild(link);
    });
  } else if (data.fonts?.google?.length) {
    const families = data.fonts.google
      .map(f => `family=${encodeURIComponent(f.family)}:wght@${f.weights.join(';')}`)
      .join('&');
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

  const originalCssRef = useRef<string | null>(null);
  useEffect(() => {
    if (originalCssRef.current === null) {
      originalCssRef.current = document.getElementById('sleek-applied-design')?.textContent ?? '';
    }
  }, []);

  useEffect(() => {
    if (appliedDesign) {
      const storedCss = localStorage.getItem(STORAGE_KEY + ':css');
      if (storedCss) {
        upsertStyle('sleek-applied-design', storedCss);
      }
    }
  }, []);

  const applyDesign = useCallback((slug: string, name: string, data: DesignData) => {
    const css = buildCssVars(data);
    upsertStyle('sleek-applied-design', css);
    loadFonts(data);

    const entry: AppliedDesign = { slug, name };
    setAppliedDesign(entry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
    localStorage.setItem(STORAGE_KEY + ':css', css);
  }, []);

  const resetDesign = useCallback(() => {
    removeStyle('sleek-applied-design');
    removeFonts();
    setAppliedDesign(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY + ':css');
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
