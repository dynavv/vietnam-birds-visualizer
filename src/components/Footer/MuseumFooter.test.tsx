import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MuseumFooter } from './MuseumFooter';

describe('MuseumFooter Component', () => {
  it('renders collapsed footer initially with expand button', () => {
    render(<MuseumFooter />);
    expect(screen.getByTestId('museum-footer')).toBeDefined();
    expect(screen.getByText(/Avifauna of Vietnam/)).toBeDefined();
    expect(screen.getByText(/Phương pháp luận & Nguồn Dữ liệu/)).toBeDefined();
  });

  it('expands to reveal 3 grouped academic cards when clicked', () => {
    render(<MuseumFooter />);
    const toggleBtn = screen.getByRole('button', { name: /Mở rộng xem phương pháp luận/i });
    fireEvent.click(toggleBtn);

    expect(screen.getByText(/1. Hệ Thống Phân Loại & Danh Pháp/)).toBeDefined();
    expect(screen.getByText(/2. Vùng Sinh Thái & Bảo Tồn/)).toBeDefined();
    expect(screen.getByText(/3. Bản Quyền & Tư Liệu Mở/)).toBeDefined();
    expect(screen.getByText(/IOC World Bird List/)).toBeDefined();
    expect(screen.getByText(/BirdLife International/)).toBeDefined();
    expect(screen.getByText(/Xeno-canto Foundation/)).toBeDefined();
  });

  it('collapses when clicking the collapse button', () => {
    render(<MuseumFooter />);
    const toggleBtn = screen.getByRole('button', { name: /Mở rộng xem phương pháp luận/i });
    fireEvent.click(toggleBtn);

    const collapseBtns = screen.getAllByRole('button', { name: /Thu gọn/i });
    expect(collapseBtns.length).toBeGreaterThan(0);
    fireEvent.click(collapseBtns[0]);

    expect(screen.getByText(/Phương pháp luận & Nguồn Dữ liệu/)).toBeDefined();
  });
});
