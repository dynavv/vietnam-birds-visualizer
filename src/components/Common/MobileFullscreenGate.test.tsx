import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MobileFullscreenGate } from './MobileFullscreenGate';

describe('MobileFullscreenGate Component', () => {
  it('renders fullscreen desktop recommendation with copy link button', () => {
    render(<MobileFullscreenGate />);

    expect(screen.getByTestId('mobile-fullscreen-gate')).toBeDefined();
    expect(screen.getByText('Avifauna of Vietnam')).toBeDefined();
    expect(screen.getByText(/Vui lòng truy cập trên Máy tính/i)).toBeDefined();
    expect(screen.getByText(/sẽ sớm được cập nhật trong tương lai!/i)).toBeDefined();
    expect(screen.getByText(/Sao chép liên kết để mở trên máy tính/i)).toBeDefined();
  });

  it('triggers clipboard copy when clicking copy button', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock
      }
    });

    render(<MobileFullscreenGate />);

    const copyBtn = screen.getByText(/Sao chép liên kết để mở trên máy tính/i);
    fireEvent.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalledTimes(1);
    expect(await screen.findByText(/Đã sao chép liên kết!/i)).toBeDefined();
  });
});
