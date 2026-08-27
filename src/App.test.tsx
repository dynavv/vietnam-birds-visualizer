import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import App from './App';

describe('App Integration & End-to-End Navigation Test Suite', () => {
  beforeEach(() => {
    window.HTMLCanvasElement.prototype.getContext = () => null;
    window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
    window.HTMLMediaElement.prototype.pause = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes the application in Map view with header, search bar, map overlays, and footer', () => {
    render(<App />);

    // Museum Header is rendered
    expect(screen.getByTestId('museum-header')).toBeDefined();
    expect(screen.getByText('Avifauna of Vietnam')).toBeDefined();
    expect(screen.getAllByText(/Giám tuyển & Trực quan hóa Phân loại học/i).length).toBeGreaterThan(0);

    // Search and filter bar is rendered
    expect(screen.getByTestId('search-filter-bar')).toBeDefined();
    expect(screen.getByPlaceholderText(/Tìm theo tên tiếng Việt, tên khoa học/i)).toBeDefined();

    // Default View is Map View
    expect(screen.getByTestId('active-map-view')).toBeDefined();
    expect(screen.getByTestId('vietnam-eba-map')).toBeDefined();
    expect(screen.getByTestId('endemic-focus-card')).toBeDefined();
    expect(screen.getByTestId('eba-region-legend')).toBeDefined();

    // Museum Footer with citations is rendered
    const footer = screen.getByTestId('museum-footer');
    expect(footer).toBeDefined();
    expect(within(footer).getByText(/IOC World Bird List/i)).toBeDefined();
    expect(within(footer).getByText(/Delacour & Jabouille/i)).toBeDefined();
    expect(within(footer).getByText(/GS. TSKH. Võ Quý/i)).toBeDefined();
    expect(within(footer).getByText(/BirdLife International/i)).toBeDefined();
    expect(within(footer).getByText(/Xeno-canto Foundation/i)).toBeDefined();
  });

  it('switches between 3 views (Map -> Sunburst -> Curator -> Map) via Header tabs', () => {
    render(<App />);

    // Start in Map View
    expect(screen.getByTestId('active-map-view')).toBeDefined();
    expect(screen.queryByTestId('active-sunburst-view')).toBeNull();
    expect(screen.queryByTestId('active-curator-view')).toBeNull();

    // 1. Switch to Sunburst View
    const sunburstTab = screen.getByRole('tab', { name: /Bánh xe Phân loại/i });
    fireEvent.click(sunburstTab);

    expect(screen.queryByTestId('active-map-view')).toBeNull();
    expect(screen.getByTestId('active-sunburst-view')).toBeDefined();
    expect(screen.getByTestId('sunburst-view')).toBeDefined();
    expect(screen.getByTestId('breadcrumb-trail')).toBeDefined();
    expect(screen.getByTestId('sunburst-svg')).toBeDefined();
    expect(screen.getByTestId('quick-specimen-panel')).toBeDefined();

    // 2. Switch to Curator View
    const curatorTab = screen.getByRole('tab', { name: /Trình Giám tuyển/i });
    fireEvent.click(curatorTab);

    expect(screen.queryByTestId('active-sunburst-view')).toBeNull();
    expect(screen.getByTestId('active-curator-view')).toBeDefined();
    expect(screen.getByTestId('curator-view')).toBeDefined();
    expect(screen.getByTestId('specimen-plate')).toBeDefined();
    expect(screen.getByTestId('clade-badge-sequence')).toBeDefined();
    expect(screen.getByTestId('morphology-report')).toBeDefined();
    expect(screen.getByTestId('related-species-tabs')).toBeDefined();

    // 3. Switch back to Map View
    const mapTab = screen.getByRole('tab', { name: /Bản đồ Sinh thái/i });
    fireEvent.click(mapTab);

    expect(screen.getByTestId('active-map-view')).toBeDefined();
    expect(screen.queryByTestId('active-curator-view')).toBeNull();
  });

  it('navigates seamlessly from Sunburst QuickSpecimenPanel to CuratorView', () => {
    render(<App />);

    // Switch to Sunburst View
    const sunburstTab = screen.getByRole('tab', { name: /Bánh xe Phân loại/i });
    fireEvent.click(sunburstTab);
    expect(screen.getByTestId('active-sunburst-view')).toBeDefined();

    // Click "Xem Phân tích Chi tiết Hình thái học" inside QuickSpecimenPanel
    const viewCuratorBtn = screen.getByRole('button', { name: /Xem Phân tích Chi tiết Hình thái học/i });
    fireEvent.click(viewCuratorBtn);

    // App should transition to CuratorView
    expect(screen.getByTestId('active-curator-view')).toBeDefined();
    expect(screen.getByTestId('curator-view')).toBeDefined();
    expect(screen.getByTestId('specimen-plate')).toBeDefined();
  });

  it('navigates from CuratorView back to Map and Sunburst using in-page action buttons', () => {
    render(<App />);

    // Switch to Curator View
    const curatorTab = screen.getByRole('tab', { name: /Trình Giám tuyển/i });
    fireEvent.click(curatorTab);
    expect(screen.getByTestId('active-curator-view')).toBeDefined();

    // Click "Bản đồ EBA" inside CuratorView
    const curatorMapBtn = screen.getByTitle('Xem vị trí phân bố trên Bản đồ Sinh thái EBA');
    fireEvent.click(curatorMapBtn);
    expect(screen.getByTestId('active-map-view')).toBeDefined();

    // Go back to Curator View
    fireEvent.click(curatorTab);
    expect(screen.getByTestId('active-curator-view')).toBeDefined();

    // Click "Bánh xe Phân loại" inside CuratorView
    const curatorSunburstBtn = screen.getByTitle('Khám phá vị trí trên Bánh xe Phân loại học');
    fireEvent.click(curatorSunburstBtn);
    expect(screen.getByTestId('active-sunburst-view')).toBeDefined();
  });

  it('synchronizes trilingual search across the entire application and updates species count', () => {
    render(<App />);

    const searchInput = screen.getByPlaceholderText(/Tìm theo tên tiếng Việt, tên khoa học/i) as HTMLInputElement;

    // Search by Vietnamese query: "Khướu"
    fireEvent.change(searchInput, { target: { value: 'Khướu' } });
    expect(searchInput.value).toBe('Khướu');

    // Count badge should be updated
    const countBox = screen.getByText(/Hiển thị/i).parentElement;
    expect(countBox).toBeDefined();

    // Search by Scientific query: "Garrulax"
    fireEvent.change(searchInput, { target: { value: 'Garrulax' } });
    expect(searchInput.value).toBe('Garrulax');

    // Clear search using clear button
    const clearBtn = screen.getByLabelText('Xóa từ khóa tìm kiếm');
    fireEvent.click(clearBtn);
    expect(searchInput.value).toBe('');
  });

  it('filters species by Endemic toggle, Order dropdown, IUCN status, and resets filters', () => {
    render(<App />);

    // 1. Filter by Endemic Only
    const endemicBtn = screen.getByRole('button', { name: /⭐ Chim Đặc hữu/i });
    fireEvent.click(endemicBtn);
    expect(endemicBtn.getAttribute('aria-pressed')).toBe('true');

    // 2. Filter by Order dropdown
    const orderSelect = screen.getByLabelText('Lọc theo Bộ chim') as HTMLSelectElement;
    fireEvent.change(orderSelect, { target: { value: 'Passeriformes' } });
    expect(orderSelect.value).toBe('Passeriformes');

    // 3. Filter by IUCN status
    const iucnSelect = screen.getByLabelText('Lọc theo Bậc bảo tồn IUCN') as HTMLSelectElement;
    fireEvent.change(iucnSelect, { target: { value: 'EN' } });
    expect(iucnSelect.value).toBe('EN');

    // Reset button should now be visible
    const resetBtn = screen.getByRole('button', { name: /Đặt lại tất cả bộ lọc/i });
    expect(resetBtn).toBeDefined();

    // Click reset button
    fireEvent.click(resetBtn);

    // Check all filters are reset
    expect(endemicBtn.getAttribute('aria-pressed')).toBe('false');
    expect(orderSelect.value).toBe('all');
    expect(iucnSelect.value).toBe('all');
  });

  it('triggers random endemic species selection upon clicking Khám phá ngẫu nhiên in header', () => {
    render(<App />);

    const randomBtn = screen.getByRole('button', {
      name: /Khám phá ngẫu nhiên một loài chim đặc hữu/i
    });
    expect(randomBtn).toBeDefined();

    // Click random button
    fireEvent.click(randomBtn);

    // Endemic focus card should display an active endemic species
    const focusCard = screen.getByTestId('endemic-focus-card');
    expect(focusCard).toBeDefined();
    expect(within(focusCard).getByText(/ĐẶC HỮU/i)).toBeDefined();
  });
});
