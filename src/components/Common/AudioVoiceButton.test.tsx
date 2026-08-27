import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { AudioVoiceButton } from './AudioVoiceButton';
import type { AudioCallInfo } from '../../types/bird';

describe('AudioVoiceButton Component', () => {
  let playMock: ReturnType<typeof vi.fn>;
  let pauseMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    playMock = vi.fn().mockResolvedValue(undefined);
    pauseMock = vi.fn();

    // Mock HTMLMediaElement prototype
    window.HTMLMediaElement.prototype.play = playMock;
    window.HTMLMediaElement.prototype.pause = pauseMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders disabled / placeholder state when no audioInfo is provided (no autoplay)', () => {
    render(<AudioVoiceButton audioInfo={null} />);
    expect(screen.getByText(/Bản thu đang cập nhật/i)).toBeDefined();
    expect(playMock).not.toHaveBeenCalled();
  });

  it('renders icon-only placeholder when audio is missing', () => {
    render(<AudioVoiceButton audioInfo={null} variant="icon-only" />);
    expect(screen.getByLabelText(/Bản thu đang cập nhật/i)).toBeDefined();
    expect(playMock).not.toHaveBeenCalled();
  });

  it('renders play button when audioInfo is provided, but DOES NOT autoplay on mount', () => {
    const mockAudio: AudioCallInfo = {
      audioUrl: 'https://xeno-canto.org/sounds/uploaded/sample.mp3',
      duration: '0:34',
      recordist: 'Nguyen Van A',
      location: 'Bach Ma NP'
    };

    render(<AudioVoiceButton audioInfo={mockAudio} birdName="Khướu Ngọc Linh" />);

    // Check button exists
    const button = screen.getByRole('button');
    expect(button).toBeDefined();
    expect(screen.getByText(/Nghe tiếng hót/i)).toBeDefined();
    expect(screen.getByText(/\(0:34\)/i)).toBeDefined();

    // Verify strict NO autoplay rule
    expect(playMock).not.toHaveBeenCalled();
  });

  it('triggers audio playback only when user clicks the button', async () => {
    const mockAudio: AudioCallInfo = {
      audioUrl: 'https://xeno-canto.org/sounds/uploaded/sample.mp3',
      duration: '0:34'
    };

    render(<AudioVoiceButton audioInfo={mockAudio} birdName="Khướu Ngọc Linh" />);

    const button = screen.getByRole('button');
    await act(async () => {
      fireEvent.click(button);
    });

    expect(playMock).toHaveBeenCalledTimes(1);
  });

  it('renders card variant with details properly', () => {
    const mockAudio: AudioCallInfo = {
      audioUrl: 'https://xeno-canto.org/sounds/uploaded/sample.mp3',
      duration: '0:45',
      recordist: 'Le Trọng Trai',
      location: 'Kon Tum'
    };

    render(<AudioVoiceButton audioInfo={mockAudio} variant="card" />);

    expect(screen.getByText('Tiếng hót tự nhiên')).toBeDefined();
    expect(screen.getByText(/Thu âm: Le Trọng Trai/i)).toBeDefined();
    expect(screen.getByText('0:45')).toBeDefined();
    expect(playMock).not.toHaveBeenCalled();
  });
});
