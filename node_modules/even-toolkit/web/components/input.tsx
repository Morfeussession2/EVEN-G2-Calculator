import * as React from 'react';
import { cn } from '../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'h-9 w-full bg-input-bg text-text rounded-[6px] px-4 text-[17px] tracking-[-0.17px] outline-none placeholder:text-text-dim transition-colors',
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = 'Input';

export { Input };
export type { InputProps };
