import { cn } from '../utils/cn';
import type { ReactNode } from 'react';

interface CTAAction {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'highlight' | 'danger';
  icon?: ReactNode;
}

interface CTAGroupProps {
  actions: CTAAction[];
  layout?: 'stacked' | 'side-by-side' | 'icon-row';
  className?: string;
}

function CTAGroup({ actions, layout = 'stacked', className }: CTAGroupProps) {
  if (layout === 'icon-row') {
    return (
      <div className={cn('flex items-center gap-3 px-3', className)}>
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={action.onClick}
            className="flex-1 flex flex-col items-center gap-1 h-[72px] justify-center rounded-[6px] bg-surface text-text cursor-pointer hover:bg-surface-light transition-colors"
          >
            {action.icon && <span className="w-6 h-6">{action.icon}</span>}
            <span className="text-[13px] tracking-[-0.13px]">{action.label}</span>
          </button>
        ))}
      </div>
    );
  }

  if (layout === 'side-by-side') {
    return (
      <div className={cn('flex items-center gap-3 px-3', className)}>
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={action.onClick}
            className={cn(
              'flex-1 h-12 rounded-[6px] text-[17px] tracking-[-0.17px] font-normal cursor-pointer transition-colors',
              action.variant === 'highlight'
                ? 'bg-accent text-text-highlight hover:opacity-90'
                : action.variant === 'danger'
                  ? 'bg-surface text-negative hover:bg-surface-light'
                  : 'bg-surface text-text hover:bg-surface-light',
            )}
          >
            {action.label}
          </button>
        ))}
      </div>
    );
  }

  // stacked (default)
  return (
    <div className={cn('flex flex-col gap-3 px-3', className)}>
      {actions.map((action) => (
        <button
          key={action.label}
          type="button"
          onClick={action.onClick}
          className={cn(
            'w-full h-12 rounded-[6px] text-[17px] tracking-[-0.17px] font-normal cursor-pointer transition-colors',
            action.variant === 'highlight'
              ? 'bg-accent text-text-highlight hover:opacity-90'
              : action.variant === 'danger'
                ? 'bg-surface text-negative hover:bg-surface-light'
                : 'bg-surface text-text hover:bg-surface-light',
          )}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}

export { CTAGroup };
export type { CTAGroupProps, CTAAction };
