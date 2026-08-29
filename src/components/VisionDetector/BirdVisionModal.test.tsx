import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BirdVisionModal } from './BirdVisionModal';
import { TaxonomyProvider } from '../../context/TaxonomyContext';
import * as birdVisionService from '../../services/birdVisionService';
import { VISION_DEMO_SAMPLES } from '../../data/visionSamples';

describe('BirdVisionModal Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders correctly when isOpen is true', () => {
    render(
      <TaxonomyProvider>
        <BirdVisionModal isOpen={true} onClose={() => {}} />
      </TaxonomyProvider>
    );

    expect(screen.getByText(/Giám Định Loài Chim Bằng Thị Giác AI/i)).toBeDefined();
    expect(screen.getByText(/Kéo & thả ảnh chim vào đây/i)).toBeDefined();
    expect(screen.getByText(/Ảnh Mẫu Thử Nghiệm Nhanh/i)).toBeDefined();
    expect(screen.getAllByText(/Gemini 2.5 Flash/i).length).toBeGreaterThan(0);
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <TaxonomyProvider>
        <BirdVisionModal isOpen={false} onClose={() => {}} />
      </TaxonomyProvider>
    );

    expect(container.firstChild).toBeNull();
  });

  it('triggers analysis when a demo sample is clicked and displays matched museum species', async () => {
    const sample = VISION_DEMO_SAMPLES[0]; // Gà lôi lam mào trắng

    vi.spyOn(birdVisionService, 'analyzeBirdImage').mockResolvedValue({
      is_bird: true,
      confidence_score: 95,
      species_vietnamese: 'Gà lôi lam mào trắng',
      species_scientific: 'Lophura edwardsi',
      family_scientific: 'Phasianidae',
      order_scientific: 'Galliformes',
      conservation_status: 'CR',
      diagnostic_features: ['Mào lông trắng muốt', 'Bộ lông xanh lam ánh kim', 'Vùng da mặt đỏ tươi'],
      brief_description: 'Loài chim trĩ đặc hữu cực kỳ nguy cấp miền Trung Việt Nam.'
    });

    const handleSelectSpecies = vi.fn();
    const handleClose = vi.fn();

    render(
      <TaxonomyProvider>
        <BirdVisionModal
          isOpen={true}
          onClose={handleClose}
          onSelectSpecies={handleSelectSpecies}
        />
      </TaxonomyProvider>
    );

    // Click sample button
    const sampleBtn = screen.getByRole('button', { name: new RegExp(sample.title, 'i') });
    fireEvent.click(sampleBtn);

    // Verify results after analysis
    await waitFor(() => {
      expect(screen.getByText(/Khớp với mẫu vật trong Bảo tàng số/i)).toBeDefined();
      expect(screen.getByText(/95% Tự tin/i)).toBeDefined();
      expect(screen.getByText(/Lophura edwardsi/i)).toBeDefined();
      expect(screen.getByText(/Mào lông trắng muốt/i)).toBeDefined();
      expect(screen.getByRole('button', { name: /Mở Cẩm Nang Giám Tuyển/i })).toBeDefined();
    });

    // Click Open Curator View button
    const curatorBtn = screen.getByRole('button', { name: /Mở Cẩm Nang Giám Tuyển/i });
    fireEvent.click(curatorBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
    expect(handleSelectSpecies).toHaveBeenCalledWith('lophura-edwardsi');
  });

  it('handles non-museum species identification and displays related museum species', async () => {
    vi.spyOn(birdVisionService, 'analyzeBirdImage').mockResolvedValue({
      is_bird: true,
      confidence_score: 88,
      species_vietnamese: 'Gà tiền Mã Lai',
      species_scientific: 'Polyplectron malacense',
      family_scientific: 'Phasianidae',
      order_scientific: 'Galliformes',
      conservation_status: 'VU',
      diagnostic_features: ['Đốm mắt lục lam trên cánh', 'Mào lông dựng đứng'],
      brief_description: 'Loài chim trĩ thuộc họ Phasianidae sinh sống tại bán đảo Mã Lai.'
    });

    const handleSelectSpecies = vi.fn();
    const handleClose = vi.fn();

    render(
      <TaxonomyProvider>
        <BirdVisionModal
          isOpen={true}
          onClose={handleClose}
          onSelectSpecies={handleSelectSpecies}
        />
      </TaxonomyProvider>
    );

    const sampleBtn = screen.getByRole('button', { name: /Nuốc bụng vàng/i });
    fireEvent.click(sampleBtn);

    await waitFor(() => {
      expect(screen.getByText(/Loài chim hoang dã/i)).toBeDefined();
      expect(screen.getByText(/Polyplectron malacense/i)).toBeDefined();
      expect(screen.getByText(/Mẫu vật cùng Họ\/Chi có trong Bảo tàng/i)).toBeDefined();
    });

    // Related species button
    const relatedButtons = screen.getAllByRole('button').filter(btn =>
      btn.textContent?.includes('Gà lôi') || btn.textContent?.includes('Gà so') || btn.textContent?.includes('Gà tiền')
    );
    expect(relatedButtons.length).toBeGreaterThan(0);

    fireEvent.click(relatedButtons[0]);
    expect(handleClose).toHaveBeenCalled();
  });

  it('handles non-bird image detection gracefully', async () => {
    vi.spyOn(birdVisionService, 'analyzeBirdImage').mockResolvedValue({
      is_bird: false,
      confidence_score: 0,
      species_vietnamese: '',
      species_scientific: '',
      family_scientific: '',
      order_scientific: '',
      conservation_status: 'LC',
      diagnostic_features: [],
      brief_description: 'Hình ảnh chứa một chiếc lá và phong cảnh rừng rậm, không có chim.'
    });

    render(
      <TaxonomyProvider>
        <BirdVisionModal isOpen={true} onClose={() => {}} />
      </TaxonomyProvider>
    );

    const sampleBtn = screen.getByRole('button', { name: /Mi Langbiang/i });
    fireEvent.click(sampleBtn);

    await waitFor(() => {
      expect(screen.getByText(/Không phát hiện thấy loài chim trong hình ảnh/i)).toBeDefined();
      expect(screen.getByText(/Hình ảnh chứa một chiếc lá/i)).toBeDefined();
      expect(screen.getByRole('button', { name: /Thử lại với ảnh khác/i })).toBeDefined();
    });

    // Reset back to dropzone
    const retryBtn = screen.getByRole('button', { name: /Thử lại với ảnh khác/i });
    fireEvent.click(retryBtn);

    expect(screen.getByText(/Kéo & thả ảnh chim vào đây/i)).toBeDefined();
  });

  it('handles API error states gracefully with retry action', async () => {
    vi.spyOn(birdVisionService, 'analyzeBirdImage').mockRejectedValue(
      new Error('Lỗi kết nối máy chủ Gemini Vision API (503)')
    );

    render(
      <TaxonomyProvider>
        <BirdVisionModal isOpen={true} onClose={() => {}} />
      </TaxonomyProvider>
    );

    const sampleBtn = screen.getByRole('button', { name: /Mi Langbiang/i });
    fireEvent.click(sampleBtn);

    await waitFor(() => {
      expect(screen.getByText(/Không thể hoàn thành giám định hình ảnh/i)).toBeDefined();
      expect(screen.getByText(/Lỗi kết nối máy chủ Gemini Vision API/i)).toBeDefined();
      expect(screen.getByRole('button', { name: /Thử lại với ảnh khác/i })).toBeDefined();
    });

    // Click retry to reset
    fireEvent.click(screen.getByRole('button', { name: /Thử lại với ảnh khác/i }));
    expect(screen.getByText(/Kéo & thả ảnh chim vào đây/i)).toBeDefined();
  });

  it('handles file upload and FileReader successfully', async () => {
    vi.spyOn(birdVisionService, 'analyzeBirdImage').mockResolvedValue({
      is_bird: true,
      confidence_score: 91,
      species_vietnamese: 'Nuốc bụng vàng',
      species_scientific: 'Harpactes oreskios',
      family_scientific: 'Trogonidae',
      order_scientific: 'Trogoniformes',
      conservation_status: 'LC',
      diagnostic_features: ['Bụng vàng nghệ', 'Đầu và ức màu ô liu'],
      brief_description: 'Loài Nuốc sinh sống ở tầng giữa tán rừng thường xanh.'
    });

    render(
      <TaxonomyProvider>
        <BirdVisionModal isOpen={true} onClose={() => {}} />
      </TaxonomyProvider>
    );

    const fileInput = screen.getByTestId('vision-file-input') as HTMLInputElement;
    const file = new File(['fake-image-bytes'], 'bird.jpg', { type: 'image/jpeg' });

    // Mock FileReader
    const mockFileReaderInstance = {
      readAsDataURL: vi.fn(function(this: any) {
        this.onload?.({ target: { result: 'data:image/jpeg;base64,mockbytes' } });
      }),
      onload: null as any,
      onerror: null as any
    };
    vi.spyOn(window, 'FileReader').mockImplementation(() => mockFileReaderInstance as any);

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/Khớp với mẫu vật trong Bảo tàng số/i)).toBeDefined();
      expect(screen.getByText(/Nuốc bụng vàng/i)).toBeDefined();
      expect(screen.getByText(/91% Tự tin/i)).toBeDefined();
    });
  });

  it('rejects invalid non-image file uploads with an error', () => {
    render(
      <TaxonomyProvider>
        <BirdVisionModal isOpen={true} onClose={() => {}} />
      </TaxonomyProvider>
    );

    const fileInput = screen.getByTestId('vision-file-input') as HTMLInputElement;
    const invalidFile = new File(['text'], 'test.txt', { type: 'text/plain' });

    fireEvent.change(fileInput, { target: { files: [invalidFile] } });

    expect(screen.getByText(/Vui lòng chọn tệp hình ảnh hợp lệ/i)).toBeDefined();
  });

  it('handles drag and drop upload', async () => {
    vi.spyOn(birdVisionService, 'analyzeBirdImage').mockResolvedValue({
      is_bird: true,
      confidence_score: 93,
      species_vietnamese: 'Mi Langbiang',
      species_scientific: 'Crocias langbianis',
      family_scientific: 'Leiothrichidae',
      order_scientific: 'Passeriformes',
      conservation_status: 'EN',
      diagnostic_features: ['Đỉnh đầu xám tro', 'Sọc đen hai bên sườn'],
      brief_description: 'Loài mi đặc hữu cao nguyên Lâm Viên.'
    });

    render(
      <TaxonomyProvider>
        <BirdVisionModal isOpen={true} onClose={() => {}} />
      </TaxonomyProvider>
    );

    const dropzone = screen.getByTestId('vision-dropzone');
    const file = new File(['fake-drop-bytes'], 'dropbird.png', { type: 'image/png' });

    // Mock FileReader
    const mockFileReaderInstance = {
      readAsDataURL: vi.fn(function(this: any) {
        this.onload?.({ target: { result: 'data:image/png;base64,mockdropbytes' } });
      }),
      onload: null as any,
      onerror: null as any
    };
    vi.spyOn(window, 'FileReader').mockImplementation(() => mockFileReaderInstance as any);

    // Test dragover and dragleave
    fireEvent.dragOver(dropzone);
    fireEvent.dragLeave(dropzone);

    // Test drop
    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [file]
      }
    });

    await waitFor(() => {
      expect(screen.getByText(/Mi Langbiang/i)).toBeDefined();
      expect(screen.getByText(/93% Tự tin/i)).toBeDefined();
    });
  });

  it('handles close button click, backdrop click, and Escape key', () => {
    const handleClose = vi.fn();

    const { rerender } = render(
      <TaxonomyProvider>
        <BirdVisionModal isOpen={true} onClose={handleClose} />
      </TaxonomyProvider>
    );

    // Close button
    const closeBtn = screen.getByLabelText(/Đóng cửa sổ/i);
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    // Backdrop click
    const backdrop = screen.getByTestId('bird-vision-modal');
    fireEvent.click(backdrop);
    expect(handleClose).toHaveBeenCalledTimes(2);

    // Escape key
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(3);

    // Unmount or close resets body overflow
    rerender(
      <TaxonomyProvider>
        <BirdVisionModal isOpen={false} onClose={handleClose} />
      </TaxonomyProvider>
    );
    expect(document.body.style.overflow).toBe('auto');
  });

  it('renders and functions cleanly even without TaxonomyProvider wrapper', () => {
    render(<BirdVisionModal isOpen={true} onClose={() => {}} />);
    expect(screen.getByText(/Giám Định Loài Chim Bằng Thị Giác AI/i)).toBeDefined();
  });
});
