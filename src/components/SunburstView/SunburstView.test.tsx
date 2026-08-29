import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SunburstView } from './SunburstView';
import { TaxonomyProvider } from '../../context/TaxonomyContext';

describe('SunburstView Component Dual-Mode', () => {
  it('renders dual-mode switchers and defaults to Radial Fan (Phả hệ vòng) mode', () => {
    render(
      <TaxonomyProvider>
        <SunburstView />
      </TaxonomyProvider>
    );

    expect(screen.getByText('Phả Hệ Vòng Tròn')).toBeDefined();
    expect(screen.getByText('Phả Hệ Phân Nhánh')).toBeDefined();
    expect(screen.getByTestId('sunburst-wheel-container')).toBeDefined();
  });

  it('switches between Radial Fan and Tree views on toggle', () => {
    render(
      <TaxonomyProvider>
        <SunburstView />
      </TaxonomyProvider>
    );

    const treeBtn = screen.getByText('Phả Hệ Phân Nhánh');
    fireEvent.click(treeBtn);

    expect(screen.getByTestId('cladogram-tree-view')).toBeDefined();

    const radialBtn = screen.getByText('Phả Hệ Vòng Tròn');
    fireEvent.click(radialBtn);

    expect(screen.getByTestId('sunburst-wheel-container')).toBeDefined();
  });
});
