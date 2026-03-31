import { cn } from '../utils/cn';
import type { ReactNode } from 'react';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}

function ScreenHeader({ title, subtitle, actions, className }: ScreenHeaderProps) {
  return (
    <div className={cn('mt-4 mb-3', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] tracking-[-0.72px] font-normal">{title}</h1>
          {subtitle && <p className="text-[13px] tracking-[-0.13px] text-text-dim mt-0.5">{subtitle}</p>}
        </div>
        {actions}
      </div>
    </div>
  );
}

export { ScreenHeader };
export type { ScreenHeaderProps };
