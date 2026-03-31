import { cn } from '../utils/cn';

interface PillProps {
  label: string;
  onRemove?: () => void;
  className?: string;
}

function Pill({ label, onRemove, className }: PillProps) {
  return (
    <span
      className={cn(
        'bg-surface-light px-3 py-1.5 rounded-[6px] text-[13px] tracking-[-0.13px] inline-flex items-center gap-2',
        className,
      )}
    >
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="text-text-dim hover:text-negative text-[11px] leading-none cursor-pointer bg-transparent border-none p-0"
        >
          ✕
        </button>
      )}
    </span>
  );
}

export { Pill };
export type { PillProps };
