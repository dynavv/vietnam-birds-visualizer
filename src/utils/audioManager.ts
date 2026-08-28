/**
 * src/utils/audioManager.ts
 * Singleton Audio Coordinator quản lý luồng phát âm thanh toàn cục cho Vietnam Birds Visualizer.
 * - Đảm bảo chỉ có duy nhất 1 bản thu được phát tại một thời điểm.
 * - Lọc bỏ lỗi giả lập 'AbortError' khi người dùng tạm dừng nhanh hoặc đổi bài.
 * - Giải phóng bộ nhớ và dọn dẹp các event listener tránh rò rỉ (memory leak).
 */

export interface AudioPlaybackState {
  isPlaying: boolean;
  isLoading: boolean;
  isError: boolean;
  currentUrl: string | null;
  durationFormatted: string;
}

export type AudioStateListener = (state: AudioPlaybackState) => void;

class AudioManager {
  private audioElement: HTMLAudioElement | null = null;
  private currentUrl: string | null = null;
  private isPlayingState = false;
  private isLoadingState = false;
  private isErrorState = false;
  private durationFormattedState = '';
  private listeners: Set<AudioStateListener> = new Set();

  private cleanupListeners: (() => void) | null = null;

  constructor() {
    // Singleton constructor
  }

  public getState(): AudioPlaybackState {
    return {
      isPlaying: this.isPlayingState,
      isLoading: this.isLoadingState,
      isError: this.isErrorState,
      currentUrl: this.currentUrl,
      durationFormatted: this.durationFormattedState
    };
  }

  public isPlaying(url?: string): boolean {
    if (!this.isPlayingState) return false;
    if (url) return this.currentUrl === url;
    return true;
  }

  public subscribe(listener: AudioStateListener): () => void {
    this.listeners.add(listener);
    // Send immediate initial state
    try {
      listener(this.getState());
    } catch (err) {
      console.error('Error in initial audio listener:', err);
    }
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (err) {
        console.error('Error in audio listener:', err);
      }
    });
  }

  private clearAudio() {
    if (this.cleanupListeners) {
      this.cleanupListeners();
      this.cleanupListeners = null;
    }
    if (this.audioElement) {
      try {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
        this.audioElement.src = '';
      } catch {
        // Ignore pause errors on reset
      }
      this.audioElement = null;
    }
  }

  public pause() {
    if (this.audioElement) {
      try {
        this.audioElement.pause();
      } catch {
        // Ignore pause errors
      }
    }
    this.isPlayingState = false;
    this.isLoadingState = false;
    this.notify();
  }

  public stop() {
    this.clearAudio();
    this.isPlayingState = false;
    this.isLoadingState = false;
    this.isErrorState = false;
    this.currentUrl = null;
    this.durationFormattedState = '';
    this.notify();
  }

  public async play(url: string): Promise<void> {
    if (!url) return;

    // If same URL and already playing, nothing to do
    if (this.currentUrl === url && this.isPlayingState && this.audioElement) {
      return;
    }

    // If same URL and paused, resume
    if (this.currentUrl === url && this.audioElement && !this.isPlayingState) {
      try {
        this.isLoadingState = true;
        this.isErrorState = false;
        this.notify();
        await this.audioElement.play();
        this.isPlayingState = true;
        this.isLoadingState = false;
        this.notify();
        return;
      } catch (err: unknown) {
        this.handlePlayError(err, url);
        return;
      }
    }

    // Different URL: Stop previous audio and initialize new audio
    this.clearAudio();
    this.currentUrl = url;
    this.isLoadingState = true;
    this.isPlayingState = false;
    this.isErrorState = false;
    this.notify();

    const audio = new Audio(url);
    audio.preload = 'auto';

    const onPlay = () => {
      this.isLoadingState = false;
      this.isPlayingState = true;
      this.isErrorState = false;
      this.notify();
    };

    const onPause = () => {
      this.isPlayingState = false;
      this.notify();
    };

    const onEnded = () => {
      this.isPlayingState = false;
      this.isLoadingState = false;
      try {
        audio.currentTime = 0;
      } catch {
        // Ignore
      }
      this.notify();
    };

    const onError = () => {
      this.isPlayingState = false;
      this.isLoadingState = false;
      this.isErrorState = true;
      this.notify();
    };

    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        const mins = Math.floor(audio.duration / 60);
        const secs = Math.floor(audio.duration % 60);
        this.durationFormattedState = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        this.notify();
      }
    };

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);

    this.cleanupListeners = () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
    };

    this.audioElement = audio;

    try {
      await audio.play();
      this.isPlayingState = true;
      this.isLoadingState = false;
      this.notify();
    } catch (err: unknown) {
      this.handlePlayError(err, url);
    }
  }

  private handlePlayError(err: unknown, url: string) {
    this.isLoadingState = false;

    // Check if error is AbortError (interrupted by user pause or navigation)
    const isAbort =
      err instanceof DOMException && err.name === 'AbortError' ||
      (typeof err === 'object' && err !== null && 'name' in err && (err as { name: string }).name === 'AbortError') ||
      (err instanceof Error && err.message.toLowerCase().includes('interrupted'));

    if (isAbort) {
      // Normal user interaction interruption, do NOT set error state
      this.isPlayingState = false;
      this.notify();
    } else {
      console.warn(`AudioManager: failed to play audio from ${url}:`, err);
      this.isErrorState = true;
      this.isPlayingState = false;
      this.notify();
    }
  }

  public async toggle(url: string): Promise<void> {
    if (this.isPlaying(url)) {
      this.pause();
    } else {
      await this.play(url);
    }
  }
}

export const audioManager = new AudioManager();
