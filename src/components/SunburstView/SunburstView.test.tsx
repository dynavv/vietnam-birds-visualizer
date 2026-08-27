import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SunburstView } from './SunburstView';
import { TaxonomyProvider } from '../../context/TaxonomyContext';

describe('SunburstView Component Dual-Mode', () => {
  it('renders dual-mode switchers and defaults to Cladogram Tree mode', () => {
    render(
      <TaxonomyProvider>
        <SunburstView />
      </TaxonomyProvider>
    );

    expect(screen.getByText('Cây Phân Nhánh')).toBeDefined();
    expect(screen.getByText('Bánh Xe Rẻ Quạt')).toBeDefined();
    expect(screen.getByTestId('cladogram-tree-view')).toBeDefined();
  });

  it('switches between Tree and Radial Fan views on toggle', () => {
    render(
      <TaxonomyProvider>
        <SunburstView />
      </TaxonomyProvider>
    );

    const radialBtn = screen.getByText('Bánh Xe Rẻ Quạt');
    fireEvent.click(radialBtn);

    expect(screen.getByTestId('sunburst-wheel-container')).toBeDefined();

    const treeBtn = screen.getByText('Cây Phân Nhánh');
    fireEvent.click(treeBtn);

    expect(screen.getByTestId('cladogram-tree-view')).toBeDefined();
  });
});
