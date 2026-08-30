import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MobileNoticeBanner, STORAGE_KEY_MOBILE_NOTICE_DISMISSED } from './MobileNoticeBanner';

describe('MobileNoticeBanner Component', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('renders recommendation notice when not dismissed', () => {
    render(<MobileNoticeBanner />);

    expect(screen.getByTestId('mobile-notice-banner')).toBeDefined();
    expect(screen.getByText(/Khuyến nghị:/i)).toBeDefined();
    expect(screen.getByText(/Máy tính \(Desktop \/ Laptop\)/i)).toBeDefined();
  });

  it('hides banner and sets sessionStorage when clicking close button', () => {
    render(<MobileNoticeBanner />);

    const closeBtn = screen.getByLabelText(/Đóng thông báo/i);
    fireEvent.click(closeBtn);

    expect(screen.queryByTestId('mobile-notice-banner')).toBeNull();
    expect(window.sessionStorage.getItem(STORAGE_KEY_MOBILE_NOTICE_DISMISSED)).toBe('true');
  });

  it('does not render if already dismissed in sessionStorage', () => {
    window.sessionStorage.setItem(STORAGE_KEY_MOBILE_NOTICE_DISMISSED, 'true');

    render(<MobileNoticeBanner />);
    expect(screen.queryByTestId('mobile-notice-banner')).toBeNull();
  });
});
