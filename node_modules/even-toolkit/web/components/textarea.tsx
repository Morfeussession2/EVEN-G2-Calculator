import * as React from 'react';
import { cn } from '../utils/cn';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, rows = 3, ...props }, ref) => (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        'w-full bg-input-bg text-text rounded-[6px] px-4 py-3 text-[17px] tracking-[-0.17px] outline-none placeholder:text-text-dim transition-colors resize-none',
        className,
      )}
      {...props}
    />
  ),
);

Textarea.displayName = 'Textarea';

export { Textarea };
export type { TextareaProps };
