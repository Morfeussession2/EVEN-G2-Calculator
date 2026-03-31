interface TimerRingProps {
  remaining: number;
  total: number;
  size?: number;
  strokeWidth?: number;
  formatFn?: (seconds: number) => string;
  className?: string;
}

function defaultFormat(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function TimerRing({
  remaining,
  total,
  size = 160,
  strokeWidth = 6,
  formatFn = defaultFormat,
  className,
}: TimerRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = total > 0 ? remaining / total : 0;
  const offset = circumference * (1 - progress);

  return (
    <div className={`relative inline-flex items-center justify-center ${className ?? ''}`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-surface-lighter"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-accent timer-ring-circle"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tabular-nums font-[var(--font-display)]">
          {formatFn(remaining)}
        </span>
        {total > 0 && (
          <span className="text-xs text-text-muted mt-1">
            {remaining > 0 ? 'remaining' : 'done!'}
          </span>
        )}
      </div>
    </div>
  );
}

export { TimerRing };
export type { TimerRingProps };
