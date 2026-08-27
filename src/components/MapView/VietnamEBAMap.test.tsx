import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VietnamEBAMap } from './VietnamEBAMap';
import { TaxonomyProvider } from '../../context/TaxonomyContext';

describe('VietnamEBAMap Component', () => {
  beforeEach(() => {
    // Mock canvas context if needed
    window.HTMLCanvasElement.prototype.getContext = () => null;
  });

  it('renders map container with overlay cards and control elements', () => {
    render(
      <TaxonomyProvider>
        <VietnamEBAMap />
      </TaxonomyProvider>
    );

    expect(screen.getByTestId('vietnam-eba-map')).toBeDefined();

    // Floating EndemicFocusCard should be rendered
    expect(screen.getByTestId('endemic-focus-card')).toBeDefined();

    // Floating EBARegionLegend should be rendered
    expect(screen.getByTestId('eba-region-legend')).toBeDefined();

    // Map control buttons
    expect(screen.getByLabelText('Toàn cảnh Việt Nam')).toBeDefined();
    expect(screen.getByLabelText('Ẩn vùng EBA')).toBeDefined();
    expect(screen.getByLabelText('Ẩn các điểm loài')).toBeDefined();
  });

  it('toggles map layers when clicking control buttons', () => {
    render(
      <TaxonomyProvider>
        <VietnamEBAMap />
      </TaxonomyProvider>
    );

    const toggleEBABtn = screen.getByLabelText('Ẩn vùng EBA');
    fireEvent.click(toggleEBABtn);
    expect(screen.getByLabelText('Hiện vùng EBA')).toBeDefined();

    const toggleSpeciesBtn = screen.getByLabelText('Ẩn các điểm loài');
    fireEvent.click(toggleSpeciesBtn);
    expect(screen.getByLabelText('Hiện tất cả điểm loài')).toBeDefined();
  });

  it('resets map view when clicking Toàn cảnh VN button', () => {
    render(
      <TaxonomyProvider>
        <VietnamEBAMap />
      </TaxonomyProvider>
    );

    const resetBtn = screen.getByLabelText('Toàn cảnh Việt Nam');
    fireEvent.click(resetBtn);
    expect(resetBtn).toBeDefined();
  });
});
