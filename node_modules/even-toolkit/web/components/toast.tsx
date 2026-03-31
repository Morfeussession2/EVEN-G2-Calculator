import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn';
import type { ReactNode } from 'react';

const toastVariants = cva(
  'flex items-center gap-4 rounded-[6px] px-4 py-3 text-[15px] tracking-[-0.15px] shadow-[0_2px_8px_rgba(0,0,0,0.12)]',
  {
    variants: {
      variant: {
        info: 'bg-surface text-text',
        warning: 'bg-accent-warning text-text',
        error: 'bg-accent-warning text-text',
        undo: 'bg-surface text-text',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  },
);

interface ToastProps extends VariantProps<typeof toastVariants> {
  message: string;
  action?: ReactNode;
  className?: string;
}

function Toast({ message, variant, action, className }: ToastProps) {
  return (
    <div className={cn(toastVariants({ variant, className }))}>
      <span className="flex-1">{message}</span>
      {action}
    </div>
  );
}

export { Toast, toastVariants };
export type { ToastProps };
