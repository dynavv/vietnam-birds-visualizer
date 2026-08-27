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

  it('renders modal content when isOpen is true', () => {
    render(<MethodologyModal isOpen={true} onClose={() => {}} />);
    expect(screen.getByTestId('methodology-modal')).toBeDefined();
    expect(screen.getByText('Phương Pháp Luận & Nguồn Dữ Liệu Học Thuật')).toBeDefined();
    expect(screen.getByText(/IOC World Bird List/)).toBeDefined();
    expect(screen.getByText(/GS. Võ Quý/)).toBeDefined();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(<MethodologyModal isOpen={true} onClose={handleClose} />);
    const closeBtn = screen.getByLabelText('Đóng cửa sổ');
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
