import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { DesignDetail } from './DesignDetail';
import { ThemeProvider } from '@/context/ThemeContext';
import { DesignProvider } from '@/context/DesignContext';
import type { TransformedDesign, DesignData } from '@/types/design';

jest.mock('@/data/designs', () => {
  const rawData = {
    $schema: 'https://luongnv.com/sleek-ui/schema/design.v1.json',
    name: 'Test Design',
    version: '1.0.0',
    description: 'A test design',
    categories: ['ui'],
    tokens: {
      colors: {
        light: { background: '0 0% 100%', primary: '245 90% 73%' },
        dark: { background: '240 33% 14%', primary: '245 90% 73%' },
      },
      typography: { fontFamily: { sans: 'Inter, sans-serif', mono: 'monospace' } },
      spacing: { unit: '0.25rem' },
      radius: { sm: '0.25rem', default: '0.5rem', lg: '1rem', full: '9999px' },
    },
    fonts: { google: [{ family: 'Inter', weights: [400, 700] }] },
    agentInstructions: { steps: [] },
  };
  return [
    {
      slug: 'test-design',
      name: 'Test Design',
      description: 'A test design',
      categories: ['minimal'],
      defaultMode: 'light',
      jsonUrl: 'https://luongnv.com/sleek-ui/designs/test-design.json',
      previewUrl: '/previews/test.jpg',
      rawData,
    },
  ];
});

const designsModule = jest.requireMock('@/data/designs') as TransformedDesign[];
const testDesign = designsModule[0];

function renderDetail(slug: string) {
  return render(
    <ThemeProvider>
      <DesignProvider>
        <MemoryRouter initialEntries={[`/designs/${slug}`]}>
          <Routes>
            <Route path="/designs/:slug" element={<DesignDetail />} />
          </Routes>
        </MemoryRouter>
      </DesignProvider>
    </ThemeProvider>,
  );
}

function writeClipboard() {
  const writeText = jest.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
  });
  return writeText;
}

beforeEach(() => {
  localStorage.clear();
  document.head.innerHTML = '';
  document.title = '';
  window.matchMedia = jest.fn().mockReturnValue({ matches: false }) as unknown as typeof window.matchMedia;
});

describe('DesignDetail characterization (#117)', () => {
  it('shows the not-found fallback for an unknown slug', () => {
    renderDetail('does-not-exist');
    expect(screen.getByText('Design not found')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Back to Catalog/i })).toHaveAttribute('href', '/');
    expect(document.title).not.toContain('sleek-ui');
  });

  it('renders the matched design and sets document.title from its name', () => {
    renderDetail('test-design');
    expect(document.title).toBe('Test Design — sleek-ui');
    expect(screen.getByRole('heading', { level: 1, name: 'Test Design' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Apply this design to the website' }),
    ).toBeInTheDocument();
  });

  it('toggles the dark preview wrapper class on and off', () => {
    const { container } = renderDetail('test-design');
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.classList.contains('dark')).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: 'Toggle preview mode' }));
    expect(wrapper.classList.contains('dark')).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Toggle preview mode' }));
    expect(wrapper.classList.contains('dark')).toBe(false);
  });

  it('copies the agent prompt to the clipboard and confirms', async () => {
    const writeText = writeClipboard();
    renderDetail('test-design');
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
    });
    expect(writeText).toHaveBeenCalledTimes(1);
    const copied = writeText.mock.calls[0][0] as string;
    expect(copied).toContain(testDesign.jsonUrl);
    expect(copied).toContain('Fetch the design system at:');
    expect(screen.getByRole('button', { name: 'Copied!' })).toBeInTheDocument();
  });

  it('applies the design then resets it back through the provider', () => {
    renderDetail('test-design');
    fireEvent.click(screen.getByRole('button', { name: 'Apply this design to the website' }));
    const style = document.getElementById('sleek-applied-design');
    expect(style?.textContent).toContain('--background: 0 0% 100%;');
    expect(localStorage.getItem('sleek-ui:applied-design')).not.toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Reset design' }));
    expect(document.getElementById('sleek-applied-design')).toBeNull();
    expect(localStorage.getItem('sleek-ui:applied-design')).toBeNull();
    expect(
      screen.getByRole('button', { name: 'Apply this design to the website' }),
    ).toBeInTheDocument();
  });
});
