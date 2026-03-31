import { cn } from '../utils/cn';

interface KbdProps {
  children: React.ReactNode;
  className?: string;
}

function Kbd({ children, className }: KbdProps) {
  return (
    <kbd
      className={cn(
        'bg-surface-light rounded-[4px] px-1.5 py-0.5 text-[13px] tracking-[-0.13px] text-text',
        className,
      )}
    >
      {children}
    </kbd>
  );
}

export { Kbd };
export type { KbdProps };
