import { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DesignCard } from '../DesignCard';
import type { TransformedDesign } from '@/types/design';

const mockState = { badgeCount: 0 };

jest.mock('@/components/ui/Badge', () => ({
  Badge: ({ children }: { children?: React.ReactNode }) => {
    mockState.badgeCount += 1;
    return <span data-testid="badge">{children}</span>;
  },
}));

const design: TransformedDesign = {
  slug: 'test-design',
  name: 'Test Design',
  categories: ['ui'],
  colors: { primary: '#000', secondary: '#111' },
  defaultMode: 'light',
  jsonUrl: '/test.json',
  thumbnailUrl: '/thumb.svg',
  detailUrl: '/designs/test-design',
  description: 'A test design',
  rawData: {} as TransformedDesign['rawData'],
};

function BumpParent() {
  const [, setTick] = useState(0);
  return (
    <>
      <button onClick={() => setTick((t) => t + 1)}>bump</button>
      <DesignCard design={design} />
    </>
  );
}

describe('DesignCard memoization (#137)', () => {
  it('renders the design details', () => {
    render(
      <MemoryRouter>
        <BumpParent />
      </MemoryRouter>
    );
    expect(screen.getByText('Test Design')).toBeInTheDocument();
    expect(screen.getByText('A test design')).toBeInTheDocument();
  });

  it('skips re-render when the parent state changes but the design prop is unchanged', () => {
    render(
      <MemoryRouter>
        <BumpParent />
      </MemoryRouter>
    );

    const initialBadgeRenders = mockState.badgeCount;
    expect(initialBadgeRenders).toBeGreaterThan(0);

    fireEvent.click(screen.getByText('bump'));

    expect(mockState.badgeCount).toBe(initialBadgeRenders);
  });
});
