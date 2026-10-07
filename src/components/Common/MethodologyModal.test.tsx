import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MethodologyModal } from './MethodologyModal';

describe('MethodologyModal Component', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(
      <MethodologyModal isOpen={false} onClose={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal content with 3 tabs when isOpen is true', () => {
    render(<MethodologyModal isOpen={true} onClose={() => {}} initialTab="about" />);
    expect(screen.getByTestId('methodology-modal')).toBeDefined();
    expect(screen.getByText('Hồ Sơ Dự Án & Bản Quyền')).toBeDefined();
    expect(screen.getByText(/Avifauna of Vietnam — Bản đồ sinh thái chim Việt Nam/)).toBeDefined();
    expect(screen.getByText(/Sứ Mệnh Giáo Dục & Tôn Vinh Thiên Nhiên Việt Nam/)).toBeDefined();

    // Switch to data tab
    const dataTabBtn = screen.getByRole('button', { name: /Nguồn Dữ Liệu & Danh Pháp/i });
    fireEvent.click(dataTabBtn);
    expect(screen.getAllByText(/IOC World Bird List/i).length).toBeGreaterThan(0);
    expect(screen.getByText('2. Tài Liệu Tham Khảo')).toBeDefined();
    expect(screen.getByText(/GS. TSKH. Võ Quý/)).toBeDefined();

    // Switch to licensing tab
    const licensingTabBtn = screen.getByRole('button', { name: /Bản Quyền & Tuyên Bố/i });
    fireEvent.click(licensingTabBtn);
    expect(screen.getByText(/Tuyên Bố Bản Quyền Hình Ảnh & Tư Liệu Mở/)).toBeDefined();
    expect(screen.getByText(/Tuyên bố Miễn Trừ Trách Nhiệm & Giá Trị Tham Khảo/)).toBeDefined();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(<MethodologyModal isOpen={true} onClose={handleClose} />);
    const closeBtn = screen.getByLabelText('Đóng cửa sổ');
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('renders feedback section with direct Google Form link', () => {
    render(<MethodologyModal isOpen={true} onClose={() => {}} initialTab="about" />);
    
    expect(screen.getByText(/Đóng Góp Ý Kiến & Báo Lỗi Dữ Liệu/i)).toBeDefined();
    
    // Check Google Form link button
    const feedbackLink = screen.getByRole('link', { name: /Mở biểu mẫu gửi ý kiến/i });
    expect(feedbackLink).toBeDefined();
    expect(feedbackLink.getAttribute('href')).toBe('https://forms.gle/iuNeqrmxN7M4Yvgs9');
    expect(feedbackLink.getAttribute('target')).toBe('_blank');
  });
});
