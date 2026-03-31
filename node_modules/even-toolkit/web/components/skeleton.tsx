import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn';

const skeletonVariants = cva('bg-surface-lighter animate-pulse', {
  variants: {
    rounded: {
      default: 'rounded-[6px]',
      full: 'rounded-full',
      none: 'rounded-none',
    },
  },
  defaultVariants: {
    rounded: 'default',
  },
});

interface SkeletonProps extends VariantProps<typeof skeletonVariants> {
  width?: string | number;
  height?: string | number;
  className?: string;
}

function Skeleton({ width, height, rounded, className }: SkeletonProps) {
  return (
    <div
      className={cn(skeletonVariants({ rounded, className }))}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : (height ?? '16px'),
      }}
    />
  );
}

export { Skeleton, skeletonVariants };
export type { SkeletonProps };
