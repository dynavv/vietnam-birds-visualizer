import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MobileFloatingSpeciesCard } from './MobileFloatingSpeciesCard';
import type { BirdSpecies } from '../../types/bird';
import { audioManager } from '../../utils/audioManager';

const mockSpeciesWithAudio: BirdSpecies = {
  id: 'crocias-langbianis',
  vietnameseName: 'Mi Langbiang',
  englishName: 'Grey-crowned Crocias',
  scientificName: 'Laniellus langbianis',
  isEndemic: true,
  endemicScope: 'vietnam',
  conservation: {
    iucn: 'EN',
    vietnamRedList: 'EN',
    description: 'Loài nguy cấp có phạm vi phân bố hẹp.'
  },
  distribution: {
    ebaRegion: 'Cao nguyên Đà Lạt',
    elevation: '900 - 1,500m',
    habitats: ['Rừng thường xanh núi cao', 'Rừng thông ba lá'],
    locations: ['Vườn quốc gia Bidoup Núi Bà', 'Đèo Ngoạn Mục'],
    coordinates: [12.00, 108.45]
  },
  illustration: {
    imageUrl: 'https://example.com/crocias.jpg',
    artist: 'Lê Mạnh Dũng'
  },
  audioCall: {
    audioUrl: 'https://example.com/audio/crocias.mp3',
    duration: '0:25',
    recordist: 'Nguyen Van A'
  },
  morphologicalAnalysis: {
    overview: 'Loài chim có bộ lông xám đặc trưng với dải lông mày trắng dài.'
  }
} as unknown as BirdSpecies;

const mockSpeciesWithoutAudio: BirdSpecies = {
  ...mockSpeciesWithAudio,
  audioCall: undefined
};

describe('MobileFloatingSpeciesCard Component', () => {
  beforeEach(() => {
    window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
    window.HTMLMediaElement.prototype.pause = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders species name, IUCN status, and distribution info properly', () => {
    render(
      <MobileFloatingSpeciesCard
        species={mockSpeciesWithAudio}
        onClose={vi.fn()}
      />
    );

    // Vietnamese name, scientific name, english name
    expect(screen.getAllByText('Mi Langbiang').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Laniellus langbianis').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Grey-crowned Crocias').length).toBeGreaterThanOrEqual(1);

    // IUCN badge and endemic badge
    expect(screen.getByText('EN')).toBeDefined();
    expect(screen.getByText('Đặc hữu VN')).toBeDefined();

    // Distribution details
    expect(screen.getByText('Cao nguyên Đà Lạt')).toBeDefined();
    expect(screen.getByText('900 - 1,500m')).toBeDefined();
    expect(screen.getByText('Vườn quốc gia Bidoup Núi Bà, Đèo Ngoạn Mục')).toBeDefined();
    expect(screen.getByText('Rừng thường xanh núi cao')).toBeDefined();
    expect(screen.getByText('Rừng thông ba lá')).toBeDefined();

    // Morphological overview quote
    expect(screen.getByText(/"Loài chim có bộ lông xám đặc trưng với dải lông mày trắng dài."/)).toBeDefined();
  });

  it('renders AudioVoiceButton when audioCall.audioUrl is present', () => {
    render(
      <MobileFloatingSpeciesCard
        species={mockSpeciesWithAudio}
        onClose={vi.fn()}
      />
    );

    const audioWrapper = screen.getByTestId('mobile-card-audio-player');
    expect(audioWrapper).toBeDefined();
    expect(screen.getByText(/Nghe tiếng hót/i)).toBeDefined();
    expect(screen.getByText(/\(0:25\)/i)).toBeDefined();
  });

  it('does not render AudioVoiceButton when audioCall is absent', () => {
    render(
      <MobileFloatingSpeciesCard
        species={mockSpeciesWithoutAudio}
        onClose={vi.fn()}
      />
    );

    expect(screen.queryByTestId('mobile-card-audio-player')).toBeNull();
    expect(screen.queryByText(/Nghe tiếng hót/i)).toBeNull();
  });

  it('calls onViewCurator and stops audio when clicking the plate image', () => {
    const handleViewCurator = vi.fn();
    const stopSpy = vi.spyOn(audioManager, 'stop');
    render(
      <MobileFloatingSpeciesCard
        species={mockSpeciesWithAudio}
        onClose={vi.fn()}
        onViewCurator={handleViewCurator}
      />
    );

    const plate = screen.getByTestId('mobile-card-artwork-plate');
    expect(plate).toBeDefined();

    fireEvent.click(plate);
    expect(handleViewCurator).toHaveBeenCalledTimes(1);
    expect(stopSpy).toHaveBeenCalledTimes(1);
  });

  it('calls onViewCurator and stops audio when clicking the species name block', () => {
    const handleViewCurator = vi.fn();
    const stopSpy = vi.spyOn(audioManager, 'stop');
    render(
      <MobileFloatingSpeciesCard
        species={mockSpeciesWithAudio}
        onClose={vi.fn()}
        onViewCurator={handleViewCurator}
      />
    );

    const nameBlock = screen.getByTestId('mobile-card-species-name');
    expect(nameBlock).toBeDefined();

    fireEvent.click(nameBlock);
    expect(handleViewCurator).toHaveBeenCalledTimes(1);
    expect(stopSpy).toHaveBeenCalledTimes(1);
  });

  it('calls onClose and stops audio when clicking the X close button', () => {
    const handleClose = vi.fn();
    const stopSpy = vi.spyOn(audioManager, 'stop');
    render(
      <MobileFloatingSpeciesCard
        species={mockSpeciesWithAudio}
        onClose={handleClose}
      />
    );

    const closeBtn = screen.getByTestId('close-species-floating-card');
    fireEvent.click(closeBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
    expect(stopSpy).toHaveBeenCalledTimes(1);
  });

  it('calls audioManager.stop() on unmount', () => {
    const stopSpy = vi.spyOn(audioManager, 'stop');
    const { unmount } = render(
      <MobileFloatingSpeciesCard
        species={mockSpeciesWithAudio}
        onClose={vi.fn()}
      />
    );

    expect(stopSpy).not.toHaveBeenCalled();
    unmount();
    expect(stopSpy).toHaveBeenCalledTimes(1);
  });

  it('supports keyboard navigation (Enter and Space) on interactive elements', () => {
    const handleViewCurator = vi.fn();
    render(
      <MobileFloatingSpeciesCard
        species={mockSpeciesWithAudio}
        onClose={vi.fn()}
        onViewCurator={handleViewCurator}
      />
    );

    const plate = screen.getByTestId('mobile-card-artwork-plate');
    fireEvent.keyDown(plate, { key: 'Enter' });
    expect(handleViewCurator).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(plate, { key: ' ' });
    expect(handleViewCurator).toHaveBeenCalledTimes(2);

    const nameBlock = screen.getByTestId('mobile-card-species-name');
    fireEvent.keyDown(nameBlock, { key: 'Enter' });
    expect(handleViewCurator).toHaveBeenCalledTimes(3);

    fireEvent.keyDown(nameBlock, { key: ' ' });
    expect(handleViewCurator).toHaveBeenCalledTimes(4);
  });

  it('does not render Cẩm nang badges or role="button" when onViewCurator is not passed', () => {
    render(
      <MobileFloatingSpeciesCard
        species={mockSpeciesWithAudio}
        onClose={vi.fn()}
      />
    );

    expect(screen.queryByTestId('mobile-card-artwork-plate')).toBeNull();
    expect(screen.queryByTestId('mobile-card-species-name')).toBeNull();
    expect(screen.queryByText('Cẩm nang')).toBeNull();
  });
});
