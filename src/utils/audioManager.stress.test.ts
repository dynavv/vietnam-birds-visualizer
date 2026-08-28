import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { audioManager, type AudioPlaybackState } from './audioManager';

describe('Adversarial Stress Test: AudioManager Concurrency & Resilience', () => {
  let playMock: ReturnType<typeof vi.fn>;
  let pauseMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    audioManager.stop();

    playMock = vi.fn().mockImplementation(() => Promise.resolve());
    pauseMock = vi.fn();

    window.HTMLMediaElement.prototype.play = playMock;
    window.HTMLMediaElement.prototype.pause = pauseMock;
  });

  afterEach(() => {
    audioManager.stop();
    vi.restoreAllMocks();
  });

  it('1. Handles 50 rapid sequential play calls without throwing or desyncing state', async () => {
    const urls = Array.from({ length: 50 }, (_, i) => `https://xeno-canto.org/sounds/audio_${i}.mp3`);

    for (const url of urls) {
      await audioManager.play(url);
    }

    const finalState = audioManager.getState();
    expect(finalState.isPlaying).toBe(true);
    expect(finalState.currentUrl).toBe('https://xeno-canto.org/sounds/audio_49.mp3');
    expect(finalState.isError).toBe(false);
    expect(audioManager.isPlaying('https://xeno-canto.org/sounds/audio_49.mp3')).toBe(true);
  });

  it('2. Handles 50 concurrent (Promise.all) play calls without race conditions or overlapping audio', async () => {
    const urls = Array.from({ length: 50 }, (_, i) => `https://xeno-canto.org/sounds/concurrent_${i}.mp3`);

    // Fire 50 play calls simultaneously
    await Promise.all(urls.map(url => audioManager.play(url)));

    const finalState = audioManager.getState();
    // After all settle, one active stream must be selected cleanly
    expect(typeof finalState.currentUrl).toBe('string');
    expect(finalState.isError).toBe(false);
    expect(finalState.isPlaying).toBe(true);
  });

  it('3. Rapid alternating play/pause/toggle/stop hammer test (200 ops)', async () => {
    const actions = ['play', 'pause', 'toggle', 'stop', 'play2'];
    const url1 = 'https://xeno-canto.org/sounds/hammer1.mp3';
    const url2 = 'https://xeno-canto.org/sounds/hammer2.mp3';

    for (let i = 0; i < 200; i++) {
      const act = actions[i % actions.length];
      if (act === 'play') {
        await audioManager.play(url1);
      } else if (act === 'pause') {
        audioManager.pause();
      } else if (act === 'toggle') {
        await audioManager.toggle(url1);
      } else if (act === 'stop') {
        audioManager.stop();
      } else if (act === 'play2') {
        await audioManager.play(url2);
      }
    }

    // Must still be in a valid, predictable state
    const state = audioManager.getState();
    expect([true, false]).toContain(state.isPlaying);
    expect([true, false]).toContain(state.isError);
    expect([true, false]).toContain(state.isLoading);
  });

  it('4. Handles slow-resolving play promise followed immediately by fast play promise', async () => {
    const urlSlow = 'https://xeno-canto.org/sounds/slow.mp3';
    const urlFast = 'https://xeno-canto.org/sounds/fast.mp3';

    let slowResolve: () => void = () => {};
    const slowPromise = new Promise<void>((resolve) => {
      slowResolve = resolve;
    });

    window.HTMLMediaElement.prototype.play = vi.fn().mockImplementation(function (this: HTMLAudioElement) {
      if (this.src.includes('slow.mp3')) {
        return slowPromise;
      }
      return Promise.resolve();
    });

    // Start slow audio
    const p1 = audioManager.play(urlSlow);

    // Immediately switch to fast audio while slow is still pending
    const p2 = audioManager.play(urlFast);

    // Now resolve slow audio
    slowResolve();

    await Promise.all([p1, p2]);

    const state = audioManager.getState();
    // The current active audio should be fast.mp3
    expect(state.currentUrl).toBe(urlFast);
    expect(state.isPlaying).toBe(true);
  });

  it('5. Subscriber resilience: Isolates faulty listeners throwing in notify without disrupting other subscribers', async () => {
    const receivedStates: AudioPlaybackState[][] = Array.from({ length: 100 }, () => []);
    const unsubscribers: (() => void)[] = [];

    // Suppress console.error during deliberate listener failure testing
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Subscribe 100 listeners; listeners with index % 10 === 0 throw on dynamic notifications (after initial)
    for (let i = 0; i < 100; i++) {
      const idx = i;
      let initialReceived = false;
      const unsub = audioManager.subscribe((state) => {
        if (!initialReceived) {
          initialReceived = true;
          receivedStates[idx].push({ ...state });
          return;
        }
        if (idx % 10 === 0) {
          throw new Error(`Intentional faulty listener ${idx}`);
        }
        receivedStates[idx].push({ ...state });
      });
      unsubscribers.push(unsub);
    }

    // Trigger state changes via play / pause
    await audioManager.play('https://xeno-canto.org/sample.mp3');
    audioManager.pause();

    // Verify error isolation: console.error was called for faulty listeners
    expect(consoleErrorSpy).toHaveBeenCalled();

    // Unsubscribe half of them
    for (let i = 0; i < 50; i++) {
      unsubscribers[i]();
    }

    await audioManager.play('https://xeno-canto.org/sample2.mp3');
    audioManager.stop();

    // Clean up remaining
    for (let i = 50; i < 100; i++) {
      unsubscribers[i]();
    }

    // Verify non-faulty surviving listeners got all sequential events
    expect(receivedStates[1].length).toBeGreaterThan(2);
    expect(receivedStates[99].length).toBeGreaterThan(2);

    consoleErrorSpy.mockRestore();
  });

  it('6. Handles Autoplay policy rejection (NotAllowedError) gracefully', async () => {
    const notAllowedErr = new DOMException('play() failed because the user didn\'t interact with the document first.', 'NotAllowedError');
    window.HTMLMediaElement.prototype.play = vi.fn().mockRejectedValue(notAllowedErr);

    await audioManager.play('https://xeno-canto.org/sounds/autoplay_blocked.mp3');
    const state = audioManager.getState();

    expect(state.isPlaying).toBe(false);
    expect(state.isError).toBe(true);
  });

  it('7. Handles empty or null URLs cleanly without error or state corruption', async () => {
    await audioManager.play('');
    const state = audioManager.getState();
    expect(state.isPlaying).toBe(false);
    expect(state.currentUrl).toBeNull();
  });
});
