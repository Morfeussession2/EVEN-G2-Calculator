import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-4 rounded-[6px] font-normal transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none text-[17px] tracking-[-0.17px]',
  {
    variants: {
      variant: {
        highlight: 'bg-accent text-text-highlight hover:opacity-90',
        default: 'bg-surface text-text hover:bg-surface-light',
        ghost: 'text-text-dim hover:text-text hover:bg-surface-light',
        danger: 'bg-surface text-negative hover:bg-surface-light',
        secondary: 'bg-surface-light text-text-dim hover:text-text hover:bg-surface-lighter',
      },
      size: {
        sm: 'h-9 px-4 text-[15px] tracking-[-0.15px]',
        default: 'h-12 px-4',
        lg: 'h-12 px-6',
        icon: 'h-9 w-9 text-[15px]',
      },
    },
    defaultVariants: {
      variant: 'highlight',
      size: 'default',
    },
  },
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  ),
);

Button.displayName = 'Button';

export { Button, buttonVariants };
export type { ButtonProps };
