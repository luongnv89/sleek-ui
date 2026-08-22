import { readFileSync } from 'fs';
import { join } from 'path';

const root = join(__dirname, '..', '..');
const read = (rel: string) => readFileSync(join(root, rel), 'utf8');

describe('bundle composition contracts (#135, #136)', () => {
  it('keeps the GitHub Pages base path intact', () => {
    expect(read('vite.config.js')).toContain("base: '/sleek-ui/'");
  });

  it('configures vendor manualChunks for route-level splitting (#136)', () => {
    const config = read('vite.config.js');
    expect(config).toContain('manualChunks');
    expect(config).toContain("'vendor-react'");
    expect(config).toContain("'vendor'");
  });

  it('enables gzip compression output (#136)', () => {
    const config = read('vite.config.js');
    expect(config).toMatch(/vite-plugin-compression/);
    expect(config).toMatch(/compression\(\{/);
    expect(config).toMatch(/algorithm:\s*'gzip'/);
  });

  it('no longer ships design JSON eagerly in the main chunk (#135)', () => {
    const loader = read(join('src', 'data', 'designs.ts'));
    expect(loader).not.toContain('eager: true');
    expect(loader).toContain("import.meta.glob");
    expect(loader).toContain('loadDesigns');
    expect(loader).toContain('loadDesignData');
  });

  it('loads the detail route through React.lazy inside Suspense (#136)', () => {
    const app = read(join('src', 'App.tsx'));
    expect(app).toContain('lazy(() =>');
    expect(app).toContain("import('@/components/DesignDetail')");
    expect(app).toContain('<Suspense');
    // DesignDetail must not be statically imported into the entry chunk
    expect(app).not.toContain("import { DesignDetail } from '@/components/DesignDetail'");
  });
});
