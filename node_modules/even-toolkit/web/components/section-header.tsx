import { cn } from '../utils/cn';
import type { ReactNode } from 'react';

interface SectionHeaderProps {
  title: string;
  action?: ReactNode;
  className?: string;
}

function SectionHeader({ title, action, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between mb-3 mt-6', className)}>
      <span className="text-[20px] tracking-[-0.6px] font-normal text-text">{title}</span>
      {action}
    </div>
  );
}

export { SectionHeader };
export type { SectionHeaderProps };
