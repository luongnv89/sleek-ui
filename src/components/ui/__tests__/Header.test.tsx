import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { Header } from '../Header';

function renderHeader() {
  return render(
    <MemoryRouter>
      <ThemeProvider>
        <Header />
      </ThemeProvider>
    </MemoryRouter>,
  );
}

function openMenu() {
  fireEvent.click(screen.getByRole('button', { name: /Open menu/i }));
}

function firstMenuLink() {
  return document.querySelector<HTMLAnchorElement>('div.border-t nav a[href="/"]')!;
}

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
});

describe('Header mobile menu (#139)', () => {
  it('closes on Escape and moves focus back to the toggle button', () => {
    renderHeader();
    const toggle = screen.getByRole('button', { name: /Open menu/i });
    openMenu();
    expect(screen.getByRole('button', { name: /Close menu/i })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByRole('button', { name: /Close menu/i })).toBeNull();
    expect(document.activeElement).toBe(toggle);
  });

  it('moves focus into the menu when opened', () => {
    renderHeader();
    openMenu();
    expect(document.activeElement).toBe(firstMenuLink());
  });

  it('wraps Tab from the last menu item back to the first', () => {
    renderHeader();
    openMenu();
    const browse = screen.getByRole('button', { name: 'Browse Designs' });
    browse.focus();

    fireEvent.keyDown(document, { key: 'Tab' });

    expect(document.activeElement).toBe(firstMenuLink());
  });
});
