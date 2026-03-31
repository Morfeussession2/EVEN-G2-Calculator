import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn';

const cardVariants = cva('rounded-[6px] bg-surface', {
  variants: {
    variant: {
      default: '',
      elevated: 'shadow-lg shadow-black/12',
      interactive: 'transition-colors hover:bg-surface-light cursor-pointer',
    },
    padding: {
      none: 'p-0',
      sm: 'p-3',
      default: 'p-4',
      lg: 'p-6',
    },
  },
  defaultVariants: {
    variant: 'default',
    padding: 'default',
  },
});

interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, padding, className }))}
      {...props}
    />
  ),
);

Card.displayName = 'Card';

export { Card, cardVariants };
export type { CardProps };
