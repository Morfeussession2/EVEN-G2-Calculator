import { cn } from '../utils/cn';

interface SliderIndicatorProps {
  count: number;
  active: number;
  className?: string;
}

function SliderIndicator({ count, active, className }: SliderIndicatorProps) {
  return (
    <div className={cn('flex items-center justify-center gap-1.5', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'rounded-full transition-all',
            i === active
              ? 'w-[18px] h-1 bg-accent'
              : 'w-1 h-1 bg-surface-lighter',
          )}
        />
      ))}
    </div>
  );
}

interface PageIndicatorProps {
  count: number;
  active: number;
  className?: string;
}

function PageIndicator({ count, active, className }: PageIndicatorProps) {
  return (
    <div className={cn('flex w-full h-[3px] gap-0.5', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'flex-1 rounded-full transition-colors',
            i === active ? 'bg-accent' : 'bg-surface-lighter',
          )}
        />
      ))}
    </div>
  );
}

export { SliderIndicator, PageIndicator };
export type { SliderIndicatorProps, PageIndicatorProps };
