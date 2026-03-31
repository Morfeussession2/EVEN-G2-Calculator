import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn';

const dividerVariants = cva('border-t border-border w-full', {
  variants: {
    variant: {
      default: 'my-0',
      spaced: 'my-6',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

interface DividerProps
  extends React.HTMLAttributes<HTMLHRElement>,
    VariantProps<typeof dividerVariants> {}

function Divider({ className, variant, ...props }: DividerProps) {
  return <hr className={cn(dividerVariants({ variant, className }))} {...props} />;
}

export { Divider, dividerVariants };
export type { DividerProps };
