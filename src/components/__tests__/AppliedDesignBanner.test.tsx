import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DesignProvider } from '@/context/DesignContext';
import { AppliedDesignBanner } from '../AppliedDesignBanner';
import type { DesignData } from '@/types/design';

jest.mock('@/data/designs', () => ({
  __esModule: true,
  loadDesigns: jest.fn(async () => []),
  loadDesignData: jest.fn(async () => null),
}));

const safeData: DesignData = {
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
  fonts: {},
  agentInstructions: { steps: [] },
};

function renderBanner() {
  return render(
    <MemoryRouter>
      <DesignProvider>
        <AppliedDesignBanner />
      </DesignProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe('AppliedDesignBanner dismiss vs reset (#140)', () => {
  it('dismiss (X) hides the banner but keeps the applied design', () => {
    localStorage.setItem(
      'sleek-ui:applied-design',
      JSON.stringify({ slug: 'test-design', name: 'Test Design', data: safeData })
    );
    renderBanner();

    expect(screen.getByText(/Design applied:/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss banner' }));
    expect(screen.queryByText(/Design applied:/)).not.toBeInTheDocument();
    // The design is still applied — style element and storage untouched
    expect(localStorage.getItem('sleek-ui:applied-design')).not.toBeNull();
  });

  it('Reset clears the applied design and offers Undo that restores it', async () => {
    localStorage.setItem(
      'sleek-ui:applied-design',
      JSON.stringify({ slug: 'test-design', name: 'Test Design', data: safeData })
    );
    const { container } = renderBanner();

    fireEvent.click(screen.getByRole('button', { name: /Reset/i }));
    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
    expect(screen.getByText('Design removed.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Undo design removal' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Undo design removal' }));
    await waitFor(() => {
      expect(screen.getByText(/Design applied:/)).toBeInTheDocument();
    });
    expect(document.getElementById('sleek-applied-design')).not.toBeNull();
    expect(localStorage.getItem('sleek-ui:applied-design')).toContain('test-design');
  });

  it('renders nothing without an applied design or pending undo', () => {
    const { container } = renderBanner();
    expect(container).toBeEmptyDOMElement();
  });
});
