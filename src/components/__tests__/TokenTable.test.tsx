import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TokenTable } from '../TokenTable';
import type { DesignTokens } from '../../types/design';

const tokens: DesignTokens = {
  colors: {
    light: {
      background: '0 0% 100%',
      primary: '245 90% 73%',
    },
    dark: {
      background: '240 33% 14%',
      primary: '245 90% 60%',
    },
  },
  typography: {
    fontFamily: { sans: 'Inter, sans-serif' },
    fontSize: { base: '1rem' },
    fontWeight: { bold: 700 },
    lineHeight: { normal: '1.5' },
    letterSpacing: { normal: '0' },
  },
  spacing: { unit: '4px', md: '16px' },
  radius: { sm: '0.125rem', default: '0.375rem', lg: '0.5rem', full: '9999px' },
  shadows: { sm: '0 1px 2px 0 rgba(0,0,0,0.05)' },
};

function mockClipboard() {
  const writeText = jest.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
    writable: true,
  });
  return writeText;
}

describe('TokenTable', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders both light (L) and dark (D) copy controls for a color', () => {
    mockClipboard();
    render(<TokenTable tokens={tokens} />);

    // Two color keys, each with an L and a D copy button.
    expect(
      screen.getByRole('button', { name: /copy light value for primary/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /copy dark value for primary/i })
    ).toBeInTheDocument();
  });

  it('copies the light HSL value when the light copy button is clicked', async () => {
    // Set up user-event first, then install our clipboard spy so it isn't
    // overridden by user-event's own navigator.clipboard stub.
    const user = userEvent.setup();
    const writeText = mockClipboard();
    render(<TokenTable tokens={tokens} />);

    await user.click(
      screen.getByRole('button', { name: /copy light value for primary/i })
    );

    expect(writeText).toHaveBeenCalledWith('245 90% 73%');
  });

  it('shows transient "copied" feedback (Check icon) after a successful copy', async () => {
    mockClipboard();
    const user = userEvent.setup();
    render(<TokenTable tokens={tokens} />);

    const lightBtn = screen.getByRole('button', {
      name: /copy light value for primary/i,
    });

    // Before copy: no check icon inside the button.
    expect(lightBtn.querySelector('.text-green-500')).toBeNull();

    await user.click(lightBtn);

    // After copy: the Check icon (green) appears.
    await waitFor(() =>
      expect(lightBtn.querySelector('.text-green-500')).not.toBeNull()
    );
  });

  it('reverts the copied feedback after the 1500ms reset window', async () => {
    jest.useFakeTimers();
    mockClipboard();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<TokenTable tokens={tokens} />);

    const lightBtn = screen.getByRole('button', {
      name: /copy light value for primary/i,
    });

    await user.click(lightBtn);
    await waitFor(() =>
      expect(lightBtn.querySelector('.text-green-500')).not.toBeNull()
    );

    act(() => {
      jest.advanceTimersByTime(1600);
    });

    expect(lightBtn.querySelector('.text-green-500')).toBeNull();
    jest.useRealTimers();
  });

  it('does not throw when unmounted with a pending copy-feedback timer', async () => {
    jest.useFakeTimers();
    mockClipboard();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const warn = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { unmount } = render(<TokenTable tokens={tokens} />);

    const lightBtn = screen.getByRole('button', {
      name: /copy light value for primary/i,
    });
    await user.click(lightBtn);
    // Flush the copied state so the 1500ms reset timer is genuinely pending at
    // unmount (this is the cleanup path the fix exercises).
    await waitFor(() =>
      expect(lightBtn.querySelector('.text-green-500')).not.toBeNull()
    );

    // Unmount before the 1500ms timer fires, then advance — the hook must have
    // cleared its timer on unmount so no setState-after-unmount warning fires.
    unmount();
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
    jest.useRealTimers();
  });
});
