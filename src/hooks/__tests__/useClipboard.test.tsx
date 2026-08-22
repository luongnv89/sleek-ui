import { render, screen, fireEvent, act } from '@testing-library/react';
import { COPY_FEEDBACK_MS, useClipboard } from '../useClipboard';

function mockClipboard(impl?: () => Promise<void>) {
  const writeText = jest.fn(impl ?? (() => Promise.resolve()));
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
  });
  return writeText;
}

function Harness({ value }: { value?: string }) {
  const { copied, error, copy } = useClipboard<'x' | null>('x', null);
  return (
    <div>
      <button type="button" onClick={() => void copy(value)}>
        copy
      </button>
      <span data-testid="copied">{copied === 'x' ? 'copied' : 'idle'}</span>
      <span data-testid="error">{error ?? ''}</span>
    </div>
  );
}

describe('useClipboard (#132)', () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('sets copied feedback for exactly COPY_FEEDBACK_MS', async () => {
    jest.useFakeTimers();
    mockClipboard();
    render(<Harness value="hello" />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
      await Promise.resolve();
    });

    expect(screen.getByTestId('copied')).toHaveTextContent('copied');
    expect(screen.getByTestId('error')).toBeEmptyDOMElement();

    // The reset timer must not fire before the shared constant elapses.
    act(() => {
      jest.advanceTimersByTime(COPY_FEEDBACK_MS - 1);
    });
    expect(screen.getByTestId('copied')).toHaveTextContent('copied');

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(screen.getByTestId('copied')).toHaveTextContent('idle');
  });

  it('shows error feedback on denied permission without an unhandled rejection', async () => {
    const rejections: unknown[] = [];
    const onUnhandled = (reason: unknown) => rejections.push(reason);
    process.on('unhandledRejection', onUnhandled);

    mockClipboard(() => Promise.reject(new DOMException('denied', 'NotAllowedError')));
    render(<Harness value="hello" />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
      await Promise.resolve();
      await Promise.resolve();
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(screen.getByTestId('error')).toHaveTextContent('denied');
    expect(screen.getByTestId('copied')).toHaveTextContent('idle');
    expect(rejections).toEqual([]);
    process.off('unhandledRejection', onUnhandled);
  });

  it('does not setState after unmount mid-timeout', async () => {
    jest.useFakeTimers();
    mockClipboard();
    const warn = jest.spyOn(console, 'error').mockImplementation(() => {});
    // Discriminating signal: React 18 silently no-ops setState-after-unmount,
    // so the cleanup is only proven if clearTimeout actually ran on unmount.
    const clearSpy = jest.spyOn(global, 'clearTimeout');

    const { unmount } = render(<Harness value="hello" />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
      await Promise.resolve();
    });

    // Unmount while the COPY_FEEDBACK_MS reset timer is still pending.
    unmount();

    act(() => {
      jest.advanceTimersByTime(COPY_FEEDBACK_MS + 1000);
    });

    expect(clearSpy).toHaveBeenCalled();
    expect(warn.mock.calls.join('\n')).not.toMatch(/setState|not wrapped in act/i);
  });

  it('resolves to false and skips the clipboard when text is empty', async () => {
    const writeText = mockClipboard();
    render(<Harness />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });
    expect(writeText).not.toHaveBeenCalled();
    expect(screen.getByTestId('error')).toHaveTextContent('Cannot copy empty text');
  });
});
