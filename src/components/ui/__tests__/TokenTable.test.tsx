import { render, screen, fireEvent } from '@testing-library/react';
import { TokenTable } from '../../TokenTable';
import type { DesignTokens } from '@/types/design';

const tokens: DesignTokens = {
  colors: { light: { background: '0 0% 100%' }, dark: { background: '240 10% 4%' } },
  typography: { fontFamily: {}, fontSize: {}, fontWeight: {}, lineHeight: {}, letterSpacing: {} },
  spacing: { unit: '4px' },
  radius: { sm: '2px', default: '4px', lg: '8px', full: '9999px' },
};

const toggle = () => screen.getByRole('button', { name: /Toggle swatch preview/i });

describe('TokenTable dark-preview control (#134)', () => {
  it('toggles internally when uncontrolled (no previewDark props)', () => {
    render(<TokenTable tokens={tokens} />);
    expect(toggle()).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(toggle());
    expect(toggle()).toHaveAttribute('aria-pressed', 'true');
  });

  it('reports through onPreviewDarkChange instead of local state when controlled', () => {
    const onPreviewDarkChange = jest.fn();
    const { rerender } = render(
      <TokenTable tokens={tokens} previewDark={false} onPreviewDarkChange={onPreviewDarkChange} />,
    );
    fireEvent.click(toggle());
    expect(onPreviewDarkChange).toHaveBeenCalledWith(true);
    // Controlled state wins — the button only changes after the parent re-renders.
    expect(toggle()).toHaveAttribute('aria-pressed', 'false');
    rerender(
      <TokenTable tokens={tokens} previewDark onPreviewDarkChange={onPreviewDarkChange} />,
    );
    expect(toggle()).toHaveAttribute('aria-pressed', 'true');
  });
});
