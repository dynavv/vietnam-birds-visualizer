import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import App from './App';

describe('App Integration & End-to-End Navigation Test Suite', () => {
  beforeEach(() => {
    window.HTMLCanvasElement.prototype.getContext = () => null;
    window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
    window.HTMLMediaElement.prototype.pause = vi.fn();
    try {
      if (typeof window !== 'undefined' && window.history) {
        window.history.replaceState(null, '', '/');
      }
    } catch {
      // Safe fallback
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes the application in Map view with header, map overlays, and footer', () => {
    render(<App />);

    // Museum Header is rendered
    expect(screen.getByTestId('museum-header')).toBeDefined();
    expect(screen.getAllByText('Avifauna of Vietnam').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Giám tuyển & Trực quan hóa Phân loại học/i).length).toBeGreaterThan(0);

    // Default View is Map View
    expect(screen.getByTestId('active-map-view')).toBeDefined();
    expect(screen.getByTestId('vietnam-eba-map')).toBeDefined();
    expect(screen.getByTestId('endemic-focus-card')).toBeDefined();
    expect(screen.getByTestId('eba-region-legend')).toBeDefined();

    // Museum Footer with citations is rendered
    const footer = screen.getByTestId('museum-footer');
    expect(footer).toBeDefined();
    expect(within(footer).getByText(/Giới thiệu/i)).toBeDefined();
    expect(within(footer).getByText(/Nguồn dữ liệu & Danh pháp/i)).toBeDefined();
    expect(within(footer).getByText(/Bản quyền & Tuyên bố/i)).toBeDefined();
  });

  it('switches between 3 views (Map -> Sunburst -> Curator -> Map) via Header tabs', () => {
    render(<App />);

    // Start in Map View
    expect(screen.getByTestId('active-map-view')).toBeDefined();
    expect(screen.queryByTestId('active-sunburst-view')).toBeNull();
    expect(screen.queryByTestId('active-curator-view')).toBeNull();

    // 1. Switch to Sunburst View
    const sunburstTab = screen.getByRole('tab', { name: /Cây Phả hệ/i });
    fireEvent.click(sunburstTab);

    expect(screen.getByTestId('active-sunburst-view')).toBeDefined();
    expect(screen.getByTestId('sunburst-view')).toBeDefined();
    expect(screen.getByTestId('breadcrumb-trail')).toBeDefined();
    expect(screen.getByTestId('sunburst-wheel-container')).toBeDefined();
    expect(screen.getByTestId('quick-specimen-panel')).toBeDefined();

    // Toggle to tree mode
    const treeBtn = screen.getByText('Phả Hệ Phân Nhánh');
    fireEvent.click(treeBtn);
    expect(screen.getByTestId('cladogram-tree-view')).toBeDefined();

    // 2. Switch to Curator View
    const curatorTab = screen.getByRole('tab', { name: /Cẩm nang Nhận dạng/i });
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
    const sunburstTab = screen.getByRole('tab', { name: /Cây Phả hệ/i });
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

  it('opens methodology modal when clicking footer links', () => {
    render(<App />);

    const footer = screen.getByTestId('museum-footer');
    const aboutBtn = within(footer).getByText(/Giới thiệu/i);
    fireEvent.click(aboutBtn);

    expect(screen.getByTestId('methodology-modal')).toBeDefined();
    expect(screen.getByText(/Sứ Mệnh Giáo Dục & Tôn Vinh Thiên Nhiên Việt Nam/i)).toBeDefined();
  });

  it('triggers random species discovery upon clicking Khám phá ngẫu nhiên in header', () => {
    render(<App />);

    const randomBtn = screen.getByLabelText(/Khám phá ngẫu nhiên một loài chim/i);
    expect(randomBtn).toBeDefined();

    // Click random button
    fireEvent.click(randomBtn);

    // Endemic focus card should display an active bird
    const focusCard = screen.getByTestId('endemic-focus-card');
    expect(focusCard).toBeDefined();
  });
});
