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
    expect(screen.getByText('Hồ Sơ Dự Án, Nguồn Học Thuật & Bản Quyền')).toBeDefined();
    expect(screen.getByText(/Sứ Mệnh Giáo Dục & Tôn Vinh Thiên Nhiên Việt Nam/)).toBeDefined();

    // Switch to data tab
    const dataTabBtn = screen.getByRole('button', { name: /Nguồn Dữ Liệu & Danh Pháp/i });
    fireEvent.click(dataTabBtn);
    expect(screen.getAllByText(/IOC World Bird List/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/GS. TSKH. Võ Quý/)).toBeDefined();

    // Switch to licensing tab
    const licensingTabBtn = screen.getByRole('button', { name: /Bản Quyền & Tuyên Bố/i });
    fireEvent.click(licensingTabBtn);
    expect(screen.getByText(/Tuyên Bố Bản Quyền Hình Ảnh & Tư Liệu Mở/)).toBeDefined();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(<MethodologyModal isOpen={true} onClose={handleClose} />);
    const closeBtn = screen.getByLabelText('Đóng cửa sổ');
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('renders feedback form and handles successful submission', () => {
    render(<MethodologyModal isOpen={true} onClose={() => {}} initialTab="about" />);
    
    expect(screen.getByText(/Đóng Góp Ý Kiến & Báo Lỗi Dữ Liệu/i)).toBeDefined();
    
    // Click open form button
    const openFormBtn = screen.getByRole('button', { name: /Mở biểu mẫu gửi ý kiến/i });
    fireEvent.click(openFormBtn);

    const textarea = screen.getByPlaceholderText(/Mô tả cụ thể thông tin bạn muốn đính chính/i);
    fireEvent.change(textarea, { target: { value: 'Phát hiện hình thái loài Nuốc bụng vàng rất chính xác.' } });

    const form = textarea.closest('form')!;
    fireEvent.submit(form);

    expect(screen.getByText(/Cảm ơn bạn đã gửi đóng góp quý báu/i)).toBeDefined();
  });
});
