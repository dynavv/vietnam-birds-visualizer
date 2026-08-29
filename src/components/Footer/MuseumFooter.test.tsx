import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MuseumFooter } from './MuseumFooter';

describe('MuseumFooter Component', () => {
  it('renders flat minimalist non-profit footer bar with copyright and 3 links', () => {
    render(<MuseumFooter />);
    expect(screen.getByTestId('museum-footer')).toBeDefined();
    expect(screen.getByText(/Avifauna of Vietnam/)).toBeDefined();
    expect(screen.getByText(/Dự án Giáo dục & Lưu trữ Số/)).toBeDefined();

    expect(screen.getByText('Giới thiệu')).toBeDefined();
    expect(screen.getByText('Nguồn dữ liệu & Danh pháp')).toBeDefined();
    expect(screen.getByText('Bản quyền & Tuyên bố')).toBeDefined();
  });

  it('opens methodology modal when clicking footer links', () => {
    render(<MuseumFooter />);
    const aboutBtn = screen.getByRole('button', { name: /Giới thiệu/i });
    fireEvent.click(aboutBtn);

    const modal = screen.getByTestId('methodology-modal');
    expect(modal).toBeDefined();
    expect(within(modal).getByText(/Sứ Mệnh Giáo Dục & Tôn Vinh Thiên Nhiên Việt Nam/i)).toBeDefined();

    // Switch to data tab inside modal
    const dataTabBtn = within(modal).getByRole('button', { name: /Nguồn Dữ Liệu & Danh Pháp/i });
    fireEvent.click(dataTabBtn);
    expect(within(modal).getByText(/Tiêu Chuẩn Phân Loại Học/i)).toBeDefined();

    // Close modal
    const closeBtns = within(modal).getAllByRole('button', { name: /Đóng cửa sổ/i });
    fireEvent.click(closeBtns[0]);
    expect(screen.queryByTestId('methodology-modal')).toBeNull();
  });
});
