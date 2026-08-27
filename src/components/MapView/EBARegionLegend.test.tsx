import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { EBARegionLegend } from './EBARegionLegend';
import { TaxonomyProvider, useTaxonomy } from '../../context/TaxonomyContext';

const TestLegendConsumer: React.FC<{ onSelectRegion?: (r: any) => void }> = ({ onSelectRegion }) => {
  const { selectedSpecies } = useTaxonomy();
  return (
    <div>
      <div data-testid="active-species-id">{selectedSpecies?.id}</div>
      <EBARegionLegend onSelectRegion={onSelectRegion} />
    </div>
  );
};

describe('EBARegionLegend Component', () => {
  it('renders all 6 Endemic Bird Areas (EBAs) in Vietnam', () => {
    render(
      <TaxonomyProvider>
        <EBARegionLegend />
      </TaxonomyProvider>
    );

    expect(screen.getByText('Vùng Chim Đặc hữu Việt Nam')).toBeDefined();
    expect(screen.getByText(/6 EBAs • BirdLife International/i)).toBeDefined();

    // Check 6 EBA Region names
    expect(screen.getByText(/Cao nguyên Đà Lạt \/ Lâm Viên/i)).toBeDefined();
    expect(screen.getByText(/Cao nguyên Kon Tum/i)).toBeDefined();
    expect(screen.getByText(/Vùng Đất thấp miền Trung/i)).toBeDefined();
    expect(screen.getByText(/Vùng núi Tây Bắc & Hoàng Liên Sơn/i)).toBeDefined();
    expect(screen.getByText(/Vùng đồng bằng & rừng đất thấp Nam Bộ/i)).toBeDefined();
    expect(screen.getByText(/Vùng núi Đông Bắc & Đá vôi Bắc Bộ/i)).toBeDefined();
  });

  it('expands region details when clicking a region card', () => {
    render(
      <TaxonomyProvider>
        <EBARegionLegend />
      </TaxonomyProvider>
    );

    const dalatBtn = screen.getByText(/Cao nguyên Đà Lạt \/ Lâm Viên/i);
    fireEvent.click(dalatBtn);

    // After expanding, check description and habitats
    expect(screen.getByText(/Vùng núi cao Nam Tây Nguyên nổi tiếng với rừng thông ba lá/i)).toBeDefined();
    expect(screen.getByText(/Sinh cảnh chính:/i)).toBeDefined();
    expect(screen.getByText(/Rừng lá kim thông ba lá/i)).toBeDefined();
    expect(screen.getByText(/Phóng to vùng/i)).toBeDefined();
  });

  it('selects species when clicking a representative species in expanded region', () => {
    render(
      <TaxonomyProvider>
        <TestLegendConsumer />
      </TaxonomyProvider>
    );

    // Expand Da Lat Plateau
    const dalatBtn = screen.getByText(/Cao nguyên Đà Lạt \/ Lâm Viên/i);
    fireEvent.click(dalatBtn);

    // Find a key species item (e.g. Sẻ thông họng vàng / Mi Langbiang)
    const speciesMatches = screen.getAllByText(/Mi Langbiang/i);
    // The second match is the species item inside the species list
    const speciesButton = speciesMatches[speciesMatches.length - 1];
    expect(speciesButton).toBeDefined();

    fireEvent.click(speciesButton);

    const activeSpecies = screen.getByTestId('active-species-id').textContent;
    expect(activeSpecies).toBeTruthy();
  });

  it('calls onSelectRegion when clicking Zoom to region button', () => {
    const handleSelectRegion = vi.fn();

    render(
      <TaxonomyProvider>
        <EBARegionLegend onSelectRegion={handleSelectRegion} />
      </TaxonomyProvider>
    );

    const dalatBtn = screen.getByText(/Cao nguyên Đà Lạt \/ Lâm Viên/i);
    fireEvent.click(dalatBtn);

    const zoomBtn = screen.getByText(/Phóng to vùng/i);
    fireEvent.click(zoomBtn);

    expect(handleSelectRegion).toHaveBeenCalledWith(expect.objectContaining({
      id: 'dalat-plateau'
    }));
  });

  it('collapses and expands the entire legend panel', () => {
    render(
      <TaxonomyProvider>
        <EBARegionLegend />
      </TaxonomyProvider>
    );

    const collapseBtn = screen.getByLabelText(/Thu gọn bảng vùng đặc hữu/i);
    fireEvent.click(collapseBtn);

    expect(screen.getByLabelText(/Mở rộng bảng vùng đặc hữu/i)).toBeDefined();
  });
});
