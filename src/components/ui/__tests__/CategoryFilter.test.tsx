import { render, screen, fireEvent } from '@testing-library/react';
import { CategoryFilter } from '../CategoryFilter';

const categories = [
  { id: 'minimal', label: 'Minimal', count: 4 },
  { id: 'dark', label: 'Dark', count: 3 },
];

function renderFilter(selected: string | null = null, onChange = jest.fn()) {
  render(
    <CategoryFilter categories={categories} selected={selected} onChange={onChange} />,
  );
  return onChange;
}

describe('CategoryFilter (#120)', () => {
  it('shows the aggregate count on the All pill', () => {
    renderFilter();
    expect(screen.getByRole('button', { name: /All/ })).toHaveTextContent('7');
  });

  it('toggles an already-selected category back off to All', () => {
    const onChange = renderFilter('minimal');
    fireEvent.click(screen.getByRole('button', { name: /Minimal/ }));
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it('selects All when its pill is clicked', () => {
    const onChange = renderFilter('dark');
    fireEvent.click(screen.getByRole('button', { name: /^All/ }));
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it('uses a group of toggle buttons instead of tab semantics (#139)', () => {
    renderFilter();
    expect(screen.getByRole('group', { name: 'Filter by category' })).toBeInTheDocument();
    expect(screen.queryByRole('tablist')).toBeNull();
    expect(screen.queryAllByRole('tab')).toHaveLength(0);
  });

  it('marks exactly one pill as aria-pressed based on the selected prop (#139)', () => {
    const { rerender } = render(
      <CategoryFilter categories={categories} selected={null} onChange={() => {}} />,
    );
    expect(screen.getByRole('button', { name: /^All/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: /Minimal/ })).toHaveAttribute(
      'aria-pressed',
      'false',
    );

    rerender(
      <CategoryFilter categories={categories} selected="dark" onChange={() => {}} />,
    );
    expect(screen.getByRole('button', { name: /Dark/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: /^All/ })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('pills meet the 44px minimum hit area (#139)', () => {
    renderFilter();
    const pills = screen.getAllByRole('button');
    expect(pills.length).toBeGreaterThanOrEqual(3);
    for (const pill of pills) {
      expect(pill).toHaveClass('min-h-[44px]');
    }
  });
});
