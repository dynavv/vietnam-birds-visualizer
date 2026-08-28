import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { audioManager } from './audioManager';

describe('AudioManager Singleton', () => {
  let playMock: ReturnType<typeof vi.fn>;
  let pauseMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    audioManager.stop();

    playMock = vi.fn().mockResolvedValue(undefined);
    pauseMock = vi.fn();

    window.HTMLMediaElement.prototype.play = playMock;
    window.HTMLMediaElement.prototype.pause = pauseMock;
  });

  afterEach(() => {
    audioManager.stop();
    vi.restoreAllMocks();
  });

  it('starts in idle, non-playing state', () => {
    const state = audioManager.getState();
    expect(state.isPlaying).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.isError).toBe(false);
    expect(state.currentUrl).toBeNull();
  });

  it('subscribes to state updates and notifies on play/pause', async () => {
    const states: boolean[] = [];
    const unsubscribe = audioManager.subscribe((state) => {
      states.push(state.isPlaying);
    });

    await audioManager.play('https://xeno-canto.org/sounds/uploaded/sample.mp3');
    expect(audioManager.isPlaying('https://xeno-canto.org/sounds/uploaded/sample.mp3')).toBe(true);

    audioManager.pause();
    expect(audioManager.isPlaying()).toBe(false);

    unsubscribe();
  });

  it('stops previous audio when playing a new audio stream (singleton bus)', async () => {
    await audioManager.play('https://xeno-canto.org/sample1.mp3');
    expect(audioManager.getState().currentUrl).toBe('https://xeno-canto.org/sample1.mp3');

    await audioManager.play('https://xeno-canto.org/sample2.mp3');
    expect(audioManager.getState().currentUrl).toBe('https://xeno-canto.org/sample2.mp3');
    expect(pauseMock).toHaveBeenCalled();
  });

  it('filters out AbortError so pause interruption does NOT trigger error badge', async () => {
    const abortErr = new DOMException('The play() request was interrupted by a call to pause().', 'AbortError');
    window.HTMLMediaElement.prototype.play = vi.fn().mockRejectedValue(abortErr);

    await audioManager.play('https://xeno-canto.org/sample_abort.mp3');
    const state = audioManager.getState();

    expect(state.isError).toBe(false);
    expect(state.isPlaying).toBe(false);
  });

  it('triggers isError = true for genuine playback failures', async () => {
    const networkErr = new Error('NETWORK_NO_SOURCE');
    window.HTMLMediaElement.prototype.play = vi.fn().mockRejectedValue(networkErr);

    await audioManager.play('https://xeno-canto.org/sample_broken.mp3');
    const state = audioManager.getState();

    expect(state.isError).toBe(true);
    expect(state.isPlaying).toBe(false);
  });

  it('toggles playback between play and pause seamlessly', async () => {
    const testUrl = 'https://xeno-canto.org/toggle_sample.mp3';

    await audioManager.toggle(testUrl);
    expect(audioManager.isPlaying(testUrl)).toBe(true);

    await audioManager.toggle(testUrl);
    expect(audioManager.isPlaying(testUrl)).toBe(false);
  });

  it('stops and resets state cleanly on stop()', async () => {
    await audioManager.play('https://xeno-canto.org/sample.mp3');
    audioManager.stop();

    const state = audioManager.getState();
    expect(state.isPlaying).toBe(false);
    expect(state.currentUrl).toBeNull();
    expect(state.isError).toBe(false);
  });

  it('safely handles throwing listener during subscribe initial call', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const throwingListener = () => {
      throw new Error('Initial listener failed');
    };

    expect(() => {
      const unsub = audioManager.subscribe(throwingListener);
      unsub();
    }).not.toThrow();

    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});

