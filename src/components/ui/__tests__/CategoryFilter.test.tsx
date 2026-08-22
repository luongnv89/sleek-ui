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
    expect(screen.getByRole('tab', { name: /All/ })).toHaveTextContent('7');
  });

  it('toggles an already-selected category back off to All', () => {
    const onChange = renderFilter('minimal');
    fireEvent.click(screen.getByRole('tab', { name: /Minimal/ }));
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it('selects All when its pill is clicked', () => {
    const onChange = renderFilter('dark');
    fireEvent.click(screen.getByRole('tab', { name: /^All/ }));
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it('marks exactly one tab as aria-selected based on the selected prop', () => {
    const { rerender } = render(
      <CategoryFilter categories={categories} selected={null} onChange={() => {}} />,
    );
    expect(screen.getByRole('tab', { name: /^All/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('tab', { name: /Minimal/ })).toHaveAttribute(
      'aria-selected',
      'false',
    );

    rerender(
      <CategoryFilter categories={categories} selected="dark" onChange={() => {}} />,
    );
    expect(screen.getByRole('tab', { name: /Dark/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('tab', { name: /^All/ })).toHaveAttribute(
      'aria-selected',
      'false',
    );
  });
});
