import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaxonomyProvider } from '../../context/TaxonomyContext';
import { GeminiNaturalistModal } from './GeminiNaturalistModal';
import * as geminiService from '../../services/geminiService';

vi.mock('../../services/geminiService', async () => {
  const actual = await vi.importActual<typeof geminiService>('../../services/geminiService');
  return {
    ...actual,
    chatWithNaturalist: vi.fn(),
    identifyBirdImage: vi.fn(),
    generateExpeditionLog: vi.fn()
  };
});

describe('GeminiNaturalistModal Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  it('renders correctly when open with default chat tab', () => {
    render(
      <TaxonomyProvider>
        <GeminiNaturalistModal isOpen={true} onClose={vi.fn()} />
      </TaxonomyProvider>
    );

    expect(screen.getByText('Gemini Avian Naturalist')).toBeDefined();
    expect(screen.getByText('Hỏi Đáp Giám Tuyển')).toBeDefined();
    expect(screen.getByText('Nhận Diện Ảnh Thực Địa')).toBeDefined();
    expect(screen.getByText('Nhật Ký Thám Hiểm')).toBeDefined();
    expect(screen.getByText('API Key & Cài Đặt')).toBeDefined();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <TaxonomyProvider>
        <GeminiNaturalistModal isOpen={false} onClose={vi.fn()} />
      </TaxonomyProvider>
    );

    expect(container.firstChild).toBeNull();
  });

  it('switches between tabs smoothly', () => {
    render(
      <TaxonomyProvider>
        <GeminiNaturalistModal isOpen={true} onClose={vi.fn()} />
      </TaxonomyProvider>
    );

    // Switch to Vision tab
    fireEvent.click(screen.getByText('Nhận Diện Ảnh Thực Địa'));
    expect(screen.getByText(/Nhận Diện Loài Chim Qua Ảnh Thực Địa/i)).toBeDefined();

    // Switch to Journal tab
    fireEvent.click(screen.getByText('Nhật Ký Thám Hiểm'));
    expect(screen.getByText(/Sinh Nhật Ký Thám Hiểm Thực Địa/i)).toBeDefined();

    // Switch to Settings tab
    fireEvent.click(screen.getByText('API Key & Cài Đặt'));
    expect(screen.getByText(/Cấu Hình Google Gemini API Key/i)).toBeDefined();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <TaxonomyProvider>
        <GeminiNaturalistModal isOpen={true} onClose={handleClose} />
      </TaxonomyProvider>
    );

    const closeBtn = screen.getByLabelText('Đóng cửa sổ');
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
