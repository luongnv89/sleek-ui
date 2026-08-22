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
