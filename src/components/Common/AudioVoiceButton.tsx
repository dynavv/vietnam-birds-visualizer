import React, { useState, useEffect, useCallback } from 'react';
import { Volume2, VolumeX, Pause, Play, AlertCircle, Loader2 } from 'lucide-react';
import type { AudioCallInfo } from '../../types/bird';
import { audioManager, AudioPlaybackState } from '../../utils/audioManager';

export interface AudioVoiceButtonProps {
  audioInfo?: AudioCallInfo | null;
  birdName?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'pill' | 'card' | 'icon-only';
  showDetails?: boolean;
  className?: string;
}

const SIZE_CONFIG = {
  sm: {
    btnPadding: 'px-2 py-1 gap-1.5 text-xs',
    iconSize: 'w-3.5 h-3.5',
    barHeight: 'h-3'
  },
  md: {
    btnPadding: 'px-3 py-1.5 gap-2 text-sm',
    iconSize: 'w-4 h-4',
    barHeight: 'h-3.5'
  },
  lg: {
    btnPadding: 'px-4 py-2 gap-2.5 text-base',
    iconSize: 'w-5 h-5',
    barHeight: 'h-4'
  }
};

export const AudioVoiceButtonComponent: React.FC<AudioVoiceButtonProps> = ({
  audioInfo,
  birdName,
  size = 'md',
  variant = 'pill',
  showDetails = true,
  className = ''
}) => {
  const [playbackState, setPlaybackState] = useState<AudioPlaybackState>(() => audioManager.getState());
  const config = SIZE_CONFIG[size];

  useEffect(() => {
    const unsubscribe = audioManager.subscribe((state) => {
      setPlaybackState(state);
    });
    return unsubscribe;
  }, []);

  const isCurrentAudio = audioInfo?.audioUrl ? playbackState.currentUrl === audioInfo.audioUrl : false;
  const isPlaying = isCurrentAudio && playbackState.isPlaying;
  const isLoading = isCurrentAudio && playbackState.isLoading;
  const isError = isCurrentAudio && playbackState.isError;
  const audioDuration = (isCurrentAudio && playbackState.durationFormatted) || audioInfo?.duration || '';

  const handleTogglePlay = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();

      if (!audioInfo?.audioUrl) {
        return;
      }

      await audioManager.toggle(audioInfo.audioUrl);
    },
    [audioInfo?.audioUrl]
  );


  // If no audio info or empty URL
  if (!audioInfo || !audioInfo.audioUrl) {
    if (variant === 'icon-only') {
      return (
        <span
          className={`inline-flex items-center justify-center p-1.5 rounded-full text-ink-muted/60 bg-paper-200/50 cursor-not-allowed ${className}`}
          title="Bản thu đang cập nhật"
          aria-label="Bản thu đang cập nhật"
        >
          <VolumeX className={config.iconSize} />
        </span>
      );
    }

    return (
      <div
        className={`inline-flex items-center rounded-lg border border-dashed border-paper-border text-ink-muted bg-paper-100/60 select-none ${config.btnPadding} ${className}`}
        title="Bản thu âm thanh đang cập nhật"
      >
        <VolumeX className={`${config.iconSize} text-ink-muted/70 flex-shrink-0`} />
        <span className="font-sans text-xs italic">Bản thu đang cập nhật</span>
      </div>
    );
  }

  // Wave visualizer bars
  const renderWaveform = () => (
    <span
      className={`inline-flex items-end gap-[2px] ${config.barHeight} mx-0.5`}
      aria-hidden="true"
    >
      {[35, 80, 55, 100, 60].map((heightPct, idx) => (
        <span
          key={idx}
          className="w-[2.5px] bg-natural-moss rounded-full transition-all duration-150"
          style={{
            height: isPlaying ? `${heightPct}%` : '25%',
            animation: isPlaying
              ? `pulse 0.75s ease-in-out infinite alternate ${idx * 0.14}s`
              : 'none'
          }}
        />
      ))}
    </span>
  );

  if (variant === 'icon-only') {
    return (
      <button
        type="button"
        onClick={handleTogglePlay}
        disabled={isLoading}
        className={`inline-flex items-center justify-center p-2 rounded-full transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-natural-moss/40 ${
          isPlaying
            ? 'bg-natural-moss text-paper-50 ring-2 ring-natural-moss/30'
            : isError
            ? 'bg-red-50 text-red-700 border border-red-200'
            : 'bg-paper-100 text-ink-800 hover:bg-natural-moss/10 hover:text-natural-moss border border-paper-border'
        } ${className}`}
        aria-label={
          isPlaying
            ? `Tạm dừng tiếng hót ${birdName || ''}`
            : `Phát tiếng hót ${birdName || ''}`
        }
        title={
          isPlaying
            ? 'Tạm dừng tiếng hót'
            : `Nghe tiếng hót tự nhiên (xeno-canto) ${audioDuration ? `[${audioDuration}]` : ''}`
        }
      >
        {isError ? (
          <AlertCircle className={config.iconSize} />
        ) : isPlaying ? (
          <Pause className={config.iconSize} />
        ) : (
          <Volume2 className={config.iconSize} />
        )}
      </button>
    );
  }

  if (variant === 'card') {
    return (
      <div
        className={`bg-paper-100/90 border border-paper-border rounded-xl p-3.5 shadow-sm transition-all hover:border-natural-moss/40 ${className}`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={handleTogglePlay}
              disabled={isLoading}
              className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                isPlaying
                  ? 'bg-natural-moss text-paper-50 shadow-sm ring-2 ring-natural-moss/30'
                  : 'bg-paper-200 text-ink-800 hover:bg-natural-moss/20 hover:text-natural-moss'
              }`}
              aria-label={isPlaying ? 'Tạm dừng' : 'Phát tiếng hót'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-semibold text-ink-900 text-sm truncate">
                  Tiếng hót tự nhiên
                </span>
                {isPlaying && renderWaveform()}
              </div>
              <p className="text-[11px] text-ink-600 truncate font-sans">
                {audioInfo.recordist ? `Thu âm: ${audioInfo.recordist}` : 'Nguồn: xeno-canto'}
                {audioInfo.location ? ` • ${audioInfo.location}` : ''}
              </p>
            </div>
          </div>

          {audioDuration && (
            <span className="flex-shrink-0 font-mono text-xs text-ink-600 bg-paper-200/70 px-2 py-0.5 rounded border border-paper-border">
              {audioDuration}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Default 'pill' variant
  return (
    <button
      type="button"
      onClick={handleTogglePlay}
      disabled={isLoading}
      className={`inline-flex items-center rounded-full font-sans font-medium transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-natural-moss/40 ${
        isPlaying
          ? 'bg-natural-moss text-paper-50 border border-natural-moss'
          : isError
          ? 'bg-red-50 text-red-800 border border-red-200 hover:bg-red-100'
          : 'bg-paper-100 text-ink-800 hover:bg-natural-moss/10 hover:text-natural-moss border border-paper-border'
      } ${config.btnPadding} ${className}`}
      aria-label={
        isPlaying
          ? `Tạm dừng tiếng hót ${birdName || ''}`
          : `Phát tiếng hót ${birdName || ''}`
      }
      title={
        isError
          ? 'Lỗi phát âm thanh'
          : isPlaying
          ? 'Tạm dừng tiếng hót'
          : 'Nghe tiếng hót tự nhiên (xeno-canto)'
      }
    >
      {isError ? (
        <AlertCircle className={`${config.iconSize} text-red-600 flex-shrink-0`} />
      ) : isLoading ? (
        <Loader2 className={`${config.iconSize} flex-shrink-0 text-natural-moss animate-spin`} />
      ) : isPlaying ? (
        <Pause className={`${config.iconSize} flex-shrink-0`} />
      ) : (
        <Volume2 className={`${config.iconSize} flex-shrink-0 text-natural-moss`} />
      )}

      <span className="font-sans text-xs">
        {isError
          ? 'Lỗi âm thanh'
          : isLoading
          ? 'Đang tải âm...'
          : isPlaying
          ? 'Đang phát...'
          : 'Nghe tiếng hót'}
      </span>

      {isPlaying && renderWaveform()}

      {showDetails && audioDuration && !isPlaying && (
        <span className="font-mono text-[11px] text-ink-500 opacity-80">
          ({audioDuration})
        </span>
      )}
    </button>
  );
};

export const AudioVoiceButton = React.memo(AudioVoiceButtonComponent);
export default AudioVoiceButton;

