import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from '../ThemeToggle';

describe('ThemeToggle (#139)', () => {
  it('announces the target state in its label when light', () => {
    const onToggle = jest.fn();
    render(<ThemeToggle theme="light" onToggle={onToggle} />);
    const button = screen.getByRole('button', { name: 'Switch to dark theme' });
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('announces the target state in its label and aria-pressed when dark', () => {
    const onToggle = jest.fn();
    render(<ThemeToggle theme="dark" onToggle={onToggle} />);
    const button = screen.getByRole('button', { name: 'Switch to light theme' });
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('fires onToggle on click', () => {
    const onToggle = jest.fn();
    render(<ThemeToggle theme="light" onToggle={onToggle} />);
    fireEvent.click(screen.getByRole('button', { name: 'Switch to dark theme' }));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
