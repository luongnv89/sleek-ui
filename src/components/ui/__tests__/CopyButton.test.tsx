import { render, screen, fireEvent, act } from '@testing-library/react';
import { CopyButton } from '../CopyButton';

async function clickAsync(element: HTMLElement) {
  await act(async () => {
    fireEvent.click(element);
  });
}

function mockClipboard(impl: () => Promise<void>) {
  const writeText = jest.fn(impl);
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
  });
  return writeText;
}

describe('CopyButton (#120)', () => {
  it('confirms a successful copy and calls onCopy(true)', async () => {
    const writeText = mockClipboard(() => Promise.resolve());
    const onCopy = jest.fn();
    render(<CopyButton text="hello" onCopy={onCopy} />);
    const button = screen.getByRole('button', { name: 'Copy to clipboard' });
    await clickAsync(button);
    expect(writeText).toHaveBeenCalledWith('hello');
    await Promise.resolve();
    expect(onCopy).toHaveBeenCalledWith(true);
    expect(screen.getByRole('button', { name: 'Text copied to clipboard' })).toBeInTheDocument();
  });

  it('enters the error state when the clipboard rejects', async () => {
    mockClipboard(() => Promise.reject(new Error('clipboard blocked')));
    const onCopy = jest.fn();
    render(<CopyButton text="hello" onCopy={onCopy} />);
    await clickAsync(screen.getByRole('button', { name: 'Copy to clipboard' }));
    await Promise.resolve();
    expect(onCopy).toHaveBeenCalledWith(false);
    expect(
      screen.getByRole('button', { name: 'Error: clipboard blocked. Click to try again' }),
    ).toBeInTheDocument();
  });

  it('reports an error without touching the clipboard for empty text', () => {
    const writeText = mockClipboard(() => Promise.resolve());
    render(<CopyButton text="" />);
    fireEvent.click(screen.getByRole('button'));
    expect(writeText).not.toHaveBeenCalled();
    expect(
      screen.getByRole('button', { name: 'Error: Cannot copy empty text. Click to try again' }),
    ).toBeInTheDocument();
  });

  it('copies via keyboard Enter activation', async () => {
    const writeText = mockClipboard(() => Promise.resolve());
    render(<CopyButton text="hello" />);
    const button = screen.getByRole('button', { name: 'Copy to clipboard' });
    fireEvent.keyDown(button, { key: 'Enter' });
    await Promise.resolve();
    expect(writeText).toHaveBeenCalledWith('hello');
  });

  it('does not update state after unmount mid-feedback (#132)', async () => {
    jest.useFakeTimers();
    mockClipboard(() => Promise.resolve());
    const warn = jest.spyOn(console, 'error').mockImplementation(() => {});
    const clearSpy = jest.spyOn(global, 'clearTimeout');

    const { unmount } = render(<CopyButton text="hello" />);
    await clickAsync(screen.getByRole('button', { name: 'Copy to clipboard' }));
    expect(
      screen.getByRole('button', { name: 'Text copied to clipboard' })
    ).toBeInTheDocument();

    // Unmount while the copied-feedback reset timer is still pending.
    unmount();

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(clearSpy).toHaveBeenCalled();
    expect(warn.mock.calls.join('\n')).not.toMatch(/setState|not wrapped in act/i);
  });
});
