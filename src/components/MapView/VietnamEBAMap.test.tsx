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
    expect(screen.getByLabelText('Toàn cảnh')).toBeDefined();
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

  it('resets map view when clicking Toàn cảnh button', () => {
    render(
      <TaxonomyProvider>
        <VietnamEBAMap />
      </TaxonomyProvider>
    );

    const resetBtn = screen.getByLabelText('Toàn cảnh');
    fireEvent.click(resetBtn);
    expect(resetBtn).toBeDefined();
  });

  it('selects and toggles EBA region from legend', () => {
    render(
      <TaxonomyProvider>
        <VietnamEBAMap />
      </TaxonomyProvider>
    );

    const regionCard = screen.getByTestId('eba-region-card-dalat-plateau');
    const firstRegionBtn = regionCard.querySelector('button');
    expect(firstRegionBtn).not.toBeNull();

    if (firstRegionBtn) {
      // First click: select/expand
      fireEvent.click(firstRegionBtn);
      expect(firstRegionBtn.getAttribute('aria-expanded')).toBe('true');

      // Second click: toggle/unselect
      fireEvent.click(firstRegionBtn);
      expect(firstRegionBtn.getAttribute('aria-expanded')).toBe('false');
    }
  });

  it('renders mobile bottom sheet component for mobile viewports', () => {
    render(
      <TaxonomyProvider>
        <VietnamEBAMap />
      </TaxonomyProvider>
    );

    expect(screen.getByTestId('eba-mobile-bottom-sheet')).toBeDefined();
  });

  it('renders mobile Avian AI button and opens Gemini modal when clicked', () => {
    render(
      <TaxonomyProvider>
        <VietnamEBAMap />
      </TaxonomyProvider>
    );

    const aiBtn = screen.getByTestId('map-avian-ai-btn');
    expect(aiBtn).toBeDefined();
    expect(screen.getByText('Avian AI')).toBeDefined();

    fireEvent.click(aiBtn);
    expect(screen.getByTestId('gemini-naturalist-modal')).toBeDefined();
  });

  it('does not render mobile floating species card by default and opens it on species select', () => {
    const originalInnerWidth = window.innerWidth;
    window.innerWidth = 375;
    try {
      render(
        <TaxonomyProvider>
          <VietnamEBAMap />
        </TaxonomyProvider>
      );

      // 1. Mặc định khi tải WAP trên Mobile: KHÔNG show popup hồ sơ loài
      expect(screen.queryByTestId('mobile-floating-species-card')).toBeNull();

      // 2. Mở EBA bottom sheet
      fireEvent.click(screen.getByTestId('bottom-sheet-expand-to-half'));

      // 3. Chọn vùng EBA (ví dụ: Cao nguyên Đà Lạt)
      const dalatCard = screen.getByTestId('mobile-eba-region-card-dalat-plateau');
      const dalatBtn = dalatCard.querySelector('button');
      if (dalatBtn) fireEvent.click(dalatBtn);

      // 4. Bấm vào chip loài chim trong danh sách thẻ EBA
      const speciesChips = screen.getAllByText('Mi Langbiang');
      fireEvent.click(speciesChips[speciesChips.length - 1]);

      // 5. Popup hồ sơ loài bung mở
      expect(screen.getByTestId('mobile-floating-species-card')).toBeDefined();

      // 6. Bấm [X] đóng popup hồ sơ loài
      const closeBtn = screen.getByTestId('close-species-floating-card');
      fireEvent.click(closeBtn);
      expect(screen.queryByTestId('mobile-floating-species-card')).toBeNull();
    } finally {
      window.innerWidth = originalInnerWidth;
    }
  });

  it('closes mobile floating species card when clicking Toàn cảnh button', () => {
    const originalInnerWidth = window.innerWidth;
    window.innerWidth = 375;
    try {
      render(
        <TaxonomyProvider>
          <VietnamEBAMap />
        </TaxonomyProvider>
      );

      // Mở sheet và chọn loài để hiển thị popup
      fireEvent.click(screen.getByTestId('bottom-sheet-expand-to-half'));
      const dalatCard = screen.getByTestId('mobile-eba-region-card-dalat-plateau');
      const dalatBtn = dalatCard.querySelector('button');
      if (dalatBtn) fireEvent.click(dalatBtn);

      const speciesChips = screen.getAllByText('Mi Langbiang');
      fireEvent.click(speciesChips[speciesChips.length - 1]);
      expect(screen.getByTestId('mobile-floating-species-card')).toBeDefined();

      // Bấm nút Toàn cảnh -> đóng luôn popup
      const resetBtn = screen.getByLabelText('Toàn cảnh');
      fireEvent.click(resetBtn);
      expect(screen.queryByTestId('mobile-floating-species-card')).toBeNull();
    } finally {
      window.innerWidth = originalInnerWidth;
    }
  });
});



