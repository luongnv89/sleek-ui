import { render, screen, fireEvent } from '@testing-library/react';
import { AgentPromptPanel } from '../AgentPromptPanel';

const PI_URL = 'https://luongnv.com/sleek-ui/designs/terminal-pi-dracula.json';
const GHOSTTY_URL = 'https://luongnv.com/sleek-ui/designs/terminal-ghostty-dracula.json';

describe('AgentPromptPanel target sync (#181)', () => {
  it('resets a stale target when navigating to a design that lacks it', () => {
    const { rerender } = render(
      <AgentPromptPanel designUrl={PI_URL} collection="terminal" appTargets={['pi', 'ghostty']} />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Ghostty' }));
    expect(screen.getByRole('button', { name: 'Ghostty' })).toHaveAttribute('aria-pressed', 'true');

    rerender(
      <AgentPromptPanel designUrl={GHOSTTY_URL} collection="terminal" appTargets={['pi']} />
    );
    expect(screen.getByRole('button', { name: 'Pi' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(/Fetch the app theme at:/)).toBeInTheDocument();
  });

  it('emits an app-theme prompt — not the web prompt — when an app theme has no targets', () => {
    render(
      <AgentPromptPanel designUrl={PI_URL} collection="terminal" appTargets={[]} />
    );
    const prompt = screen.getByText(/Fetch the app theme at:/);
    expect(prompt).toBeInTheDocument();
    expect(prompt.textContent).not.toMatch(/Fetch the design system at:/);
  });

  it('keeps the legacy web prompt byte-compatible for web designs', () => {
    render(<AgentPromptPanel designUrl={PI_URL} collection="web" />);
    expect(screen.getByText(/Fetch the design system at:/)).toBeInTheDocument();
  });
});

describe('AgentPromptPanel universal targets (#203, #202)', () => {
  it('offers Claude Code, Omarchy OS and the placeholder after the declared targets', () => {
    render(<AgentPromptPanel designUrl={PI_URL} collection="terminal" appTargets={['pi']} />);
    const labels = screen
      .getAllByRole('button', { pressed: false })
      .concat(screen.getAllByRole('button', { pressed: true }))
      .map(b => b.textContent);
    expect(labels).toEqual(expect.arrayContaining(['Pi', 'Claude Code', 'Omarchy OS', 'General AI tool (placeholder)']));
    // The declared target stays the default selection.
    expect(screen.getByRole('button', { name: 'Pi' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('switches the copied prompt to Claude Code and Omarchy OS instructions', () => {
    render(<AgentPromptPanel designUrl={PI_URL} collection="terminal" appTargets={['pi']} />);
    fireEvent.click(screen.getByRole('button', { name: 'Claude Code' }));
    expect(screen.getByRole('button', { name: 'Claude Code' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(/APPLY INSTRUCTIONS \(Claude Code\)/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Omarchy OS' }));
    expect(screen.getByText(/omarchy-theme-set <theme-slug>/)).toBeInTheDocument();
  });

  it('keeps the generic prompt for a theme with no declared targets until a universal one is picked', () => {
    render(<AgentPromptPanel designUrl={PI_URL} collection="terminal" appTargets={[]} />);
    expect(screen.getByRole('button', { name: 'Claude Code' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText(/No specific app target is selected/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Claude Code' }));
    expect(screen.getByText(/APPLY INSTRUCTIONS \(Claude Code\)/)).toBeInTheDocument();
  });

  it('keeps a picked universal target when navigating to another theme', () => {
    const { rerender } = render(<AgentPromptPanel designUrl={PI_URL} collection="terminal" appTargets={['pi']} />);
    fireEvent.click(screen.getByRole('button', { name: 'Omarchy OS' }));
    rerender(<AgentPromptPanel designUrl={GHOSTTY_URL} collection="terminal" appTargets={['ghostty']} />);
    expect(screen.getByRole('button', { name: 'Omarchy OS' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows no target chips for web designs', () => {
    render(<AgentPromptPanel designUrl={PI_URL} collection="web" />);
    expect(screen.queryByRole('button', { name: 'Claude Code' })).not.toBeInTheDocument();
  });
});
