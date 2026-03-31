import * as React from 'react';
import { cn } from '../utils/cn';

interface AudioPlayerProps {
  src: string;
  title?: string;
  className?: string;
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function AudioPlayer({ src, title, className }: AudioPlayerProps) {
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { audio.pause(); } else { audio.play(); }
    setPlaying(!playing);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * duration;
  };

  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => setDuration(audio.duration);
    const onEnd = () => setPlaying(false);

    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('ended', onEnd);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('ended', onEnd);
    };
  }, []);

  return (
    <div className={cn('bg-surface rounded-[6px] p-3 flex items-center gap-3', className)}>
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Play/Pause */}
      <button
        type="button"
        onClick={togglePlay}
        className="shrink-0 w-9 h-9 rounded-full bg-accent text-text-highlight flex items-center justify-center cursor-pointer"
      >
        {playing ? (
          <svg viewBox="0 0 24 24" className="w-4 h-4">
            <rect x={7} y={6} width={3} height={12} fill="currentColor" />
            <rect x={14} y={6} width={3} height={12} fill="currentColor" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="w-4 h-4">
            <rect x={8} y={4} width={2} height={2} fill="currentColor" />
            <rect x={8} y={6} width={2} height={2} fill="currentColor" />
            <rect x={8} y={8} width={2} height={2} fill="currentColor" />
            <rect x={8} y={10} width={2} height={2} fill="currentColor" />
            <rect x={8} y={12} width={2} height={2} fill="currentColor" />
            <rect x={8} y={14} width={2} height={2} fill="currentColor" />
            <rect x={8} y={16} width={2} height={2} fill="currentColor" />
            <rect x={10} y={6} width={2} height={2} fill="currentColor" />
            <rect x={10} y={8} width={2} height={2} fill="currentColor" />
            <rect x={10} y={10} width={2} height={2} fill="currentColor" />
            <rect x={10} y={12} width={2} height={2} fill="currentColor" />
            <rect x={10} y={14} width={2} height={2} fill="currentColor" />
            <rect x={12} y={8} width={2} height={2} fill="currentColor" />
            <rect x={12} y={10} width={2} height={2} fill="currentColor" />
            <rect x={12} y={12} width={2} height={2} fill="currentColor" />
            <rect x={14} y={10} width={2} height={2} fill="currentColor" />
          </svg>
        )}
      </button>

      {/* Info + progress */}
      <div className="flex-1 min-w-0">
        {title && <div className="text-[13px] tracking-[-0.13px] text-text truncate mb-1">{title}</div>}
        <div
          className="h-1 bg-surface-lighter rounded-full cursor-pointer"
          onClick={seek}
        >
          <div
            className="h-full bg-accent rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Time */}
      <span className="text-[11px] tracking-[-0.11px] text-text-dim tabular-nums shrink-0">
        {formatTime(currentTime)} / {formatTime(duration || 0)}
      </span>
    </div>
  );
}

export { AudioPlayer };
export type { AudioPlayerProps };
