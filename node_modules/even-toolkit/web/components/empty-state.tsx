import { cn } from '../utils/cn';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      {icon && <div className="mb-4 text-text-dim">{icon}</div>}
      <h3 className="text-[17px] tracking-[-0.17px] font-normal text-text mb-1">{title}</h3>
      {description && <p className="text-[13px] tracking-[-0.13px] text-text-dim max-w-xs">{description}</p>}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-4 h-12 px-4 rounded-[6px] bg-accent text-text-highlight text-[17px] tracking-[-0.17px] font-normal cursor-pointer hover:opacity-90 transition-opacity"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export { EmptyState };
export type { EmptyStateProps };
