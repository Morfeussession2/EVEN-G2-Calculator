import * as React from 'react';
import { cn } from '../utils/cn';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ value, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('h-1 w-full rounded-full bg-surface-lighter overflow-hidden', className)}
      {...props}
    >
      <div
        className="h-full rounded-full bg-accent transition-all duration-500 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  ),
);

Progress.displayName = 'Progress';

export { Progress };
export type { ProgressProps };
