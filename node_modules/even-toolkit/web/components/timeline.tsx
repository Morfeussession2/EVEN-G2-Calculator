import { cn } from '../utils/cn';
import type { ReactNode } from 'react';

interface TimelineEvent {
  id: string;
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  timestamp: string;
  color?: string;
}

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

function Timeline({ events, className }: TimelineProps) {
  return (
    <div className={cn('relative', className)}>
      {/* Vertical line */}
      <div className="absolute left-[11px] top-3 bottom-3 w-[2px] bg-border" />

      {events.map((event, i) => (
        <div key={event.id} className="relative flex gap-4 pb-4 last:pb-0">
          {/* Dot */}
          <div
            className="relative z-10 shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px]"
            style={{ backgroundColor: (event.color ?? 'var(--color-accent)') + '20' }}
          >
            {event.icon ?? (
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: event.color ?? 'var(--color-accent)' }} />
            )}
          </div>
          {/* Content */}
          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[15px] tracking-[-0.15px] text-text">{event.title}</span>
              <span className="text-[11px] tracking-[-0.11px] text-text-muted shrink-0">{event.timestamp}</span>
            </div>
            {event.subtitle && (
              <div className="text-[13px] tracking-[-0.13px] text-text-dim mt-0.5">{event.subtitle}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export { Timeline };
export type { TimelineProps, TimelineEvent };
