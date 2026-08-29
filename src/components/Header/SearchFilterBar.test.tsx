import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { SearchFilterBar } from './SearchFilterBar';
import { TaxonomyProvider, useTaxonomy } from '../../context/TaxonomyContext';

const TestContainer: React.FC = () => {
  const { searchQuery, onlyEndemic, selectedOrder, selectedConservation, filteredSpecies } = useTaxonomy();

  return (
    <div>
      <SearchFilterBar />
      <div data-testid="current-query">{searchQuery}</div>
      <div data-testid="current-endemic">{String(onlyEndemic)}</div>
      <div data-testid="current-order">{selectedOrder}</div>
      <div data-testid="current-conservation">{selectedConservation}</div>
      <div data-testid="current-count">{filteredSpecies.length}</div>
    </div>
  );
};

describe('SearchFilterBar Component', () => {
  it('renders search input, filter toggles, dropdowns and species count', () => {
    render(
      <TaxonomyProvider>
        <TestContainer />
      </TaxonomyProvider>
    );

    expect(screen.getByPlaceholderText(/Tìm theo tên tiếng Việt/i)).toBeDefined();
    expect(screen.getByText(/Chim Đặc hữu/i)).toBeDefined();
    expect(screen.getByLabelText(/Lọc theo Bộ chim/i)).toBeDefined();
    expect(screen.getByLabelText(/Lọc theo Bậc bảo tồn IUCN/i)).toBeDefined();
    expect(screen.getByText(/Hiển thị/i)).toBeDefined();
  });

  it('updates search query on typing and clears query on click (x)', () => {
    render(
      <TaxonomyProvider>
        <TestContainer />
      </TaxonomyProvider>
    );

    const input = screen.getByPlaceholderText(/Tìm theo tên tiếng Việt/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Khướu' } });

    expect(screen.getByTestId('current-query').textContent).toBe('Khướu');

    const clearButton = screen.getByLabelText('Xóa từ khóa tìm kiếm');
    fireEvent.click(clearButton);

    expect(screen.getByTestId('current-query').textContent).toBe('');
  });

  it('toggles onlyEndemic state when clicking the Endemic button', () => {
    render(
      <TaxonomyProvider>
        <TestContainer />
      </TaxonomyProvider>
    );

    const endemicBtn = screen.getByText(/Chim Đặc hữu/i);
    expect(screen.getByTestId('current-endemic').textContent).toBe('false');

    fireEvent.click(endemicBtn);
    expect(screen.getByTestId('current-endemic').textContent).toBe('true');

    fireEvent.click(endemicBtn);
    expect(screen.getByTestId('current-endemic').textContent).toBe('false');
  });

  it('updates order and conservation filters and shows/executes reset button', () => {
    render(
      <TaxonomyProvider>
        <TestContainer />
      </TaxonomyProvider>
    );

    const orderSelect = screen.getByLabelText('Lọc theo Bộ chim');
    const iucnSelect = screen.getByLabelText('Lọc theo Bậc bảo tồn IUCN');

    // Initially no reset button
    expect(screen.queryByLabelText('Đặt lại tất cả bộ lọc')).toBeNull();

    // Change order
    fireEvent.change(orderSelect, { target: { value: 'Galliformes' } });
    expect(screen.getByTestId('current-order').textContent).toBe('Galliformes');

    // Reset button should now be visible
    const resetBtn = screen.getByLabelText('Đặt lại tất cả bộ lọc');
    expect(resetBtn).toBeDefined();

    // Change IUCN
    fireEvent.change(iucnSelect, { target: { value: 'CR' } });
    expect(screen.getByTestId('current-conservation').textContent).toBe('CR');

    // Click reset
    fireEvent.click(resetBtn);
    expect(screen.getByTestId('current-order').textContent).toBe('all');
    expect(screen.getByTestId('current-conservation').textContent).toBe('all');
    expect(screen.getByTestId('current-endemic').textContent).toBe('false');
    expect(screen.getByTestId('current-query').textContent).toBe('');
  });
});
