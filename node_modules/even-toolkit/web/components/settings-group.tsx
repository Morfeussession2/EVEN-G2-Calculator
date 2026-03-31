import type { ReactNode } from 'react';
import { cn } from '../utils/cn';

interface SettingsGroupProps {
  label: string;
  children: ReactNode;
  className?: string;
}

function SettingsGroup({ label, children, className }: SettingsGroupProps) {
  return (
    <div className={cn('rounded-[6px] overflow-hidden', className)}>
      <div className="pb-1.5">
        <span className="text-[13px] tracking-[-0.13px] text-text-dim">{label}</span>
      </div>
      <div className="divide-y divide-border">{children}</div>
    </div>
  );
}

export { SettingsGroup };
export type { SettingsGroupProps };
