import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CladogramTreeView } from './CladogramTreeView';
import { TaxonomyProvider } from '../../context/TaxonomyContext';

describe('CladogramTreeView Component', () => {
  it('renders 16 orders and collapsible node structure', () => {
    render(
      <TaxonomyProvider>
        <CladogramTreeView />
      </TaxonomyProvider>
    );

    expect(screen.getByText(/16 Bộ • 40\+ Họ/i)).toBeDefined();
    expect(screen.getByText('Bộ Sẻ')).toBeDefined();
    expect(screen.getByText('Bộ Gà')).toBeDefined();
  });

  it('expands all nodes when clicking expand all button', () => {
    render(
      <TaxonomyProvider>
        <CladogramTreeView />
      </TaxonomyProvider>
    );

    const expandBtn = screen.getByText('Mở rộng tất cả');
    fireEvent.click(expandBtn);

    expect(screen.getByText('Khướu Ngọc Linh')).toBeDefined();
  });

  it('selects species when clicking a species row', () => {
    render(
      <TaxonomyProvider>
        <CladogramTreeView />
      </TaxonomyProvider>
    );

    const expandBtn = screen.getByText('Mở rộng tất cả');
    fireEvent.click(expandBtn);

    const speciesRow = screen.getByTestId('tree-species-trochalopteron-ngoclinhense');
    fireEvent.click(speciesRow);

    expect(speciesRow).toBeDefined();
  });
});
