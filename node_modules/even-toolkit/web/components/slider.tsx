import { cn } from '../utils/cn';
import type { ReactNode } from 'react';

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  disabled?: boolean;
  className?: string;
}

function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  leftIcon,
  rightIcon,
  disabled,
  className,
}: SliderProps) {
  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div
      className={cn(
        'flex items-center gap-3',
        disabled && 'opacity-50 pointer-events-none',
        className,
      )}
    >
      {leftIcon && <span className="shrink-0 w-6 h-6 text-text-dim">{leftIcon}</span>}
      <div className="relative flex-1 h-5 flex items-center">
        {/* Track background */}
        <div className="absolute inset-x-0 h-1 rounded-full bg-surface-lighter" />
        {/* Track fill */}
        <div
          className="absolute left-0 h-1 rounded-full bg-accent"
          style={{ width: `${percent}%` }}
        />
        {/* Native input (invisible, handles interaction) */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        {/* Thumb */}
        <div
          className="absolute w-5 h-5 rounded-full bg-text-highlight shadow-sm border border-border pointer-events-none -translate-x-1/2"
          style={{ left: `${percent}%` }}
        />
      </div>
      {rightIcon && <span className="shrink-0 w-6 h-6 text-text-dim">{rightIcon}</span>}
    </div>
  );
}

export { Slider };
export type { SliderProps };
