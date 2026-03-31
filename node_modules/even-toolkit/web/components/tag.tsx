import { cn } from '../utils/cn';
import type { ReactNode } from 'react';

interface TagProps {
  label: string;
  icon?: ReactNode;
  selected?: boolean;
  onPress?: () => void;
  className?: string;
}

function Tag({ label, icon, selected, onPress, className }: TagProps) {
  return (
    <button
      type="button"
      onClick={onPress}
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2 rounded-[6px] text-[15px] tracking-[-0.15px] font-normal transition-colors cursor-pointer shrink-0',
        selected
          ? 'bg-accent text-text-highlight'
          : 'bg-surface text-text hover:bg-surface-light',
        className,
      )}
    >
      {icon && <span className="w-5 h-5 shrink-0">{icon}</span>}
      {label}
    </button>
  );
}

interface TagCarouselProps {
  children: ReactNode;
  className?: string;
}

function TagCarousel({ children, className }: TagCarouselProps) {
  return (
    <div className={cn('flex items-center gap-2 overflow-x-auto scrollbar-hide py-2', className)}>
      {children}
    </div>
  );
}

interface TagCardProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  className?: string;
}

function TagCard({ icon, title, subtitle, onPress, className }: TagCardProps) {
  return (
    <button
      type="button"
      onClick={onPress}
      className={cn(
        'flex flex-col items-start justify-between p-4 rounded-[6px] bg-accent-warning min-w-[150px] h-[150px] cursor-pointer transition-colors shrink-0',
        className,
      )}
    >
      {icon && <span className="w-6 h-6">{icon}</span>}
      <div>
        <div className="text-[15px] tracking-[-0.45px] text-text font-normal">{title}</div>
        {subtitle && <div className="text-[13px] tracking-[-0.13px] text-text-dim mt-0.5">{subtitle}</div>}
      </div>
    </button>
  );
}

export { Tag, TagCarousel, TagCard };
export type { TagProps, TagCarouselProps, TagCardProps };
