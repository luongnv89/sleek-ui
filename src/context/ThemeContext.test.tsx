import { memo } from 'react';
import { render, screen, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from './ThemeContext';

function ToggleButton() {
  const { theme, toggleTheme } = useTheme();
  return <button onClick={toggleTheme}>{theme}</button>;
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.className = '';
  window.matchMedia = jest.fn().mockReturnValue({ matches: false }) as unknown as typeof window.matchMedia;
});

describe('ThemeContext blocked storage (#103)', () => {
  it('toggles the theme without uncaught errors when localStorage.setItem throws', () => {
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });
    try {
      render(
        <ThemeProvider>
          <ToggleButton />
        </ThemeProvider>,
      );
      act(() => {
        screen.getByText('light').click();
      });
      expect(screen.getByText('dark')).toBeInTheDocument();
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    } finally {
      setItemSpy.mockRestore();
    }
  });

  it('persists the theme to storage when writes succeed', () => {
    render(
      <ThemeProvider>
        <ToggleButton />
      </ThemeProvider>,
    );
    act(() => {
      screen.getByText('light').click();
    });
    expect(localStorage.getItem('sleek-ui:theme')).toBe('dark');
  });
});

describe('ThemeContext characterization (#118)', () => {
  it('restores the persisted theme across a reload simulation', () => {
    localStorage.setItem('sleek-ui:theme', 'dark');
    render(
      <ThemeProvider>
        <ToggleButton />
      </ThemeProvider>,
    );
    expect(screen.getByText('dark')).toBeInTheDocument();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('defaults to the system color-scheme preference when nothing is stored', () => {
    window.matchMedia = jest.fn().mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia;
    render(
      <ThemeProvider>
        <ToggleButton />
      </ThemeProvider>,
    );
    expect(screen.getByText('dark')).toBeInTheDocument();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('defaults to light and writes no storage value when storage read throws', () => {
    const getItemSpy = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });
    try {
      render(
        <ThemeProvider>
          <ToggleButton />
        </ThemeProvider>,
      );
      expect(screen.getByText('light')).toBeInTheDocument();
    } finally {
      getItemSpy.mockRestore();
    }
    expect(localStorage.getItem('sleek-ui:theme')).toBe('light');
  });

  it('throws a descriptive error when useTheme runs outside a ThemeProvider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
      expect(() => render(<ToggleButton />)).toThrow(
        'useTheme must be used within a ThemeProvider',
      );
    } finally {
      consoleError.mockRestore();
    }
  });

  it('round-trips toggle state through storage into a fresh provider mount', () => {
    const first = render(
      <ThemeProvider>
        <ToggleButton />
      </ThemeProvider>,
    );
    act(() => {
      screen.getByText('light').click();
    });
    first.unmount();

    document.documentElement.className = '';
    render(
      <ThemeProvider>
        <ToggleButton />
      </ThemeProvider>,
    );
    expect(screen.getByText('dark')).toBeInTheDocument();
    expect(localStorage.getItem('sleek-ui:theme')).toBe('dark');
  });
});

describe('Regression (#68): theme persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    window.matchMedia = jest.fn().mockReturnValue({ matches: false }) as unknown as typeof window.matchMedia;
  });

  it('persists a toggled theme to storage under the sleek-ui key', () => {
    render(
      <ThemeProvider>
        <ToggleButton />
      </ThemeProvider>,
    );
    act(() => {
      screen.getByText('light').click();
    });
    expect(localStorage.getItem('sleek-ui:theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('restores the persisted theme when the app remounts (reload simulation)', () => {
    localStorage.setItem('sleek-ui:theme', 'dark');
    render(
      <ThemeProvider>
        <ToggleButton />
      </ThemeProvider>,
    );
    expect(screen.getByText('dark')).toBeInTheDocument();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('round-trips dark mode through storage across unmount/remount', () => {
    const first = render(
      <ThemeProvider>
        <ToggleButton />
      </ThemeProvider>,
    );
    act(() => {
      screen.getByText('light').click();
    });
    first.unmount();

    document.documentElement.className = '';
    render(
      <ThemeProvider>
        <ToggleButton />
      </ThemeProvider>,
    );
    expect(screen.getByText('dark')).toBeInTheDocument();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('sleek-ui:theme')).toBe('dark');
  });
});

describe('Provider value stability (#137)', () => {
  const Probe = memo(function Probe() {
    const { toggleTheme } = useTheme();
    return <span data-testid="probe" data-toggle={typeof toggleTheme} />;
  });

  it('does not re-render memoized consumers when the provider re-renders with an unchanged theme', () => {
    let renders = 0;
    const CountingProbe = memo(function CountingProbe() {
      renders += 1;
      return <Probe />;
    });

    const { rerender } = render(
      <ThemeProvider>
        <span>unrelated sibling</span>
        <CountingProbe />
      </ThemeProvider>
    );
    expect(renders).toBe(1);

    rerender(
      <ThemeProvider>
        <span>another unrelated sibling</span>
        <CountingProbe />
      </ThemeProvider>
    );
    expect(renders).toBe(1);
  });

  it('keeps the toggleTheme callback identity stable across theme toggles', () => {
    let firstToggle: unknown;
    const Capture = memo(function Capture() {
      const { toggleTheme } = useTheme();
      if (firstToggle === undefined) firstToggle = toggleTheme;
      else if (firstToggle !== toggleTheme) throw new Error('toggleTheme identity changed');
      return <button onClick={toggleTheme}>capture</button>;
    });

    render(
      <ThemeProvider>
        <Capture />
      </ThemeProvider>
    );
    const button = screen.getByRole('button');
    act(() => {
      button.click();
    });
    act(() => {
      button.click();
    });
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
