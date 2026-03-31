import { cn } from '../utils/cn';
import type { ReactNode } from 'react';

interface AppShellProps {
  header: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * AppShell — fixed header + scrollable content + optional fixed footer.
 * Uses flexbox so it works regardless of ancestor overflow settings.
 */
function AppShell({ header, footer, children, className }: AppShellProps) {
  return (
    <div className={cn('h-dvh flex flex-col overflow-hidden', className)}>
      <div className="shrink-0 bg-bg">{header}</div>
      <div className="relative flex-1 min-h-0">
        <div className="absolute top-0 left-0 right-0 h-3 z-10 pointer-events-none" style={{ background: 'linear-gradient(var(--color-bg), transparent)' }} />
        <div className="h-full overflow-y-auto">{children}</div>
      </div>
      {footer && <div className="shrink-0 bg-bg">{footer}</div>}
    </div>
  );
}

export { AppShell };
export type { AppShellProps };
