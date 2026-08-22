import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { DesignDetail } from './DesignDetail';
import { ThemeProvider } from '@/context/ThemeContext';
import { DesignProvider } from '@/context/DesignContext';

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

jest.mock('@/data/designs', () => ({
  __esModule: true,
  loadDesigns: jest.fn(),
  loadDesignData: jest.fn(),
}));

const designsModule = jest.requireMock('@/data/designs') as {
  loadDesigns: jest.Mock;
  loadDesignData: jest.Mock;
};

const testDesign = {
  slug: 'test-design',
  name: 'Test Design',
  description: 'A test design',
  categories: ['minimal'],
  colors: { primary: '245 90% 73%', secondary: '0 0% 100%' },
  defaultMode: 'light' as const,
  jsonUrl: 'https://luongnv.com/sleek-ui/designs/test-design.json',
  thumbnailUrl: '/previews/test.jpg',
  detailUrl: '/designs/test-design',
};

beforeEach(() => {
  designsModule.loadDesigns.mockResolvedValue([testDesign]);
  designsModule.loadDesignData.mockImplementation(async (slug: string) =>
    slug === 'test-design' ? rawData : null
  );
});

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
  it('shows a loading placeholder, then the not-found fallback for an unknown slug', async () => {
    renderDetail('does-not-exist');
    expect(await screen.findByText('Design not found')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Back to Catalog/i })).toHaveAttribute('href', '/');
    // #129: an unmatched slug resets the title to the app default instead of leaving it empty
    expect(document.title).toBe('sleek-ui — Professional design systems for AI agents');
  });

  it('renders the matched design and sets document.title from its name', async () => {
    renderDetail('test-design');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Test Design' })
    ).toBeInTheDocument();
    expect(document.title).toBe('Test Design — sleek-ui');
    expect(
      screen.getByRole('button', { name: 'Apply this design to the website' }),
    ).toBeInTheDocument();
  });

  it('toggles the dark preview wrapper class on and off', async () => {
    const { container } = renderDetail('test-design');
    await screen.findByRole('heading', { level: 1, name: 'Test Design' });
    const wrapper = container.firstElementChild as HTMLElement;
    fireEvent.click(screen.getByRole('button', { name: 'Toggle preview mode' }));
    expect(wrapper.classList.contains('dark')).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Toggle preview mode' }));
    expect(wrapper.classList.contains('dark')).toBe(false);
  });

  it('copies the agent prompt to the clipboard and confirms', async () => {
    const writeText = writeClipboard();
    renderDetail('test-design');
    await screen.findByRole('heading', { level: 1, name: 'Test Design' });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
    });
    expect(writeText).toHaveBeenCalledTimes(1);
    const copied = writeText.mock.calls[0][0] as string;
    expect(copied).toContain(testDesign.jsonUrl);
    expect(copied).toContain('Fetch the design system at:');
    expect(screen.getByRole('button', { name: 'Copied!' })).toBeInTheDocument();
  });

  it('applies the design only after confirmation, then resets it back (#140)', async () => {
    renderDetail('test-design');
    await screen.findByRole('heading', { level: 1, name: 'Test Design' });
    // Apply stays disabled until the design data has been fetched on navigation (#135)
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Apply this design to the website' })).toBeEnabled()
    );
    fireEvent.click(screen.getByRole('button', { name: 'Apply this design to the website' }));

    // Nothing is applied until the confirm dialog is confirmed
    expect(screen.getByRole('dialog', { name: 'Confirm apply design' })).toBeInTheDocument();
    expect(document.getElementById('sleek-applied-design')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Confirm apply this design to the website' }));
    const style = document.getElementById('sleek-applied-design');
    expect(style?.textContent).toContain('--background: 0 0% 100%;');
    expect(localStorage.getItem('sleek-ui:applied-design')).not.toBeNull();
    expect(screen.queryByTestId('apply-confirm-dialog')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Reset design' }));
    expect(document.getElementById('sleek-applied-design')).toBeNull();
    expect(localStorage.getItem('sleek-ui:applied-design')).toBeNull();
    expect(
      screen.getByRole('button', { name: 'Apply this design to the website' }),
    ).toBeInTheDocument();
  });

  it('cancelling the apply confirmation leaves the site untouched (#140)', async () => {
    renderDetail('test-design');
    await screen.findByRole('heading', { level: 1, name: 'Test Design' });
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Apply this design to the website' })).toBeEnabled()
    );

    fireEvent.click(screen.getByRole('button', { name: 'Apply this design to the website' }));
    expect(screen.getByRole('dialog', { name: 'Confirm apply design' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByTestId('apply-confirm-dialog')).not.toBeInTheDocument();
    expect(document.getElementById('sleek-applied-design')).toBeNull();
    expect(localStorage.getItem('sleek-ui:applied-design')).toBeNull();
  });

  it('renders the unavailable state when token data cannot load, not a spinner (#140)', async () => {
    designsModule.loadDesignData.mockResolvedValueOnce(null);
    renderDetail('test-design');
    await screen.findByRole('heading', { level: 1, name: 'Test Design' });

    expect(await screen.findByText('Design tokens are unavailable for this design.')).toBeInTheDocument();
    expect(screen.queryByText('Loading design tokens...')).not.toBeInTheDocument();
  });

  it('fetches design data on navigation and renders tokens once loaded (#135)', async () => {
    let resolveData!: (value: typeof rawData | null) => void;
    designsModule.loadDesignData.mockImplementationOnce(
      () => new Promise<typeof rawData | null>(resolve => { resolveData = resolve; })
    );

    renderDetail('test-design');
    await screen.findByRole('heading', { level: 1, name: 'Test Design' });

    // Tokens section shows its loading placeholder until the fetch resolves
    expect(screen.getByText('Loading design tokens...')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Apply this design to the website' })
    ).toBeDisabled();

    resolveData(rawData);
    await waitFor(() =>
      expect(screen.queryByText('Loading design tokens...')).not.toBeInTheDocument()
    );
    expect(
      screen.getByRole('button', { name: 'Apply this design to the website' })
    ).toBeEnabled();
  });
});

describe('DesignDetail clipboard rejection (#123)', () => {
  it('degrades silently when the agent-prompt copy is rejected, with no unhandled rejection', async () => {
    const unhandled: unknown[] = [];
    const onUnhandled = (reason: unknown) => unhandled.push(reason);
    process.on('unhandledRejection', onUnhandled);

    const writeText = jest.fn().mockRejectedValue(new Error('clipboard blocked'));
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });

    try {
      renderDetail('test-design');
      await screen.findByRole('heading', { level: 1, name: 'Test Design' });
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
      });
      await Promise.resolve();
      await Promise.resolve();

      expect(writeText).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole('button', { name: 'Copied!' })).not.toBeInTheDocument();
      // page stays interactive after the rejection
      expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument();
    } finally {
      process.removeListener('unhandledRejection', onUnhandled);
    }
    expect(unhandled).toEqual([]);
  });
});

describe('DesignDetail stale-design navigation (#129)', () => {
  function NavigateProbe({ to }: { to: string }) {
    const navigate = useNavigate();
    return <button onClick={() => navigate(to)}>navigate-probe</button>;
  }

  it('resets to the not-found branch with a corrected title on valid → invalid navigation', async () => {
    render(
      <ThemeProvider>
        <DesignProvider>
          <MemoryRouter initialEntries={['/designs/test-design']}>
            <NavigateProbe to="/designs/does-not-exist" />
            <Routes>
              <Route path="/designs/:slug" element={<DesignDetail />} />
            </Routes>
          </MemoryRouter>
        </DesignProvider>
      </ThemeProvider>,
    );

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Test Design' })
    ).toBeInTheDocument();
    expect(document.title).toBe('Test Design — sleek-ui');

    fireEvent.click(screen.getByRole('button', { name: 'navigate-probe' }));

    expect(await screen.findByText('Design not found')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 1, name: 'Test Design' })).not.toBeInTheDocument();
    expect(document.title).toBe('sleek-ui — Professional design systems for AI agents');
  });
});
