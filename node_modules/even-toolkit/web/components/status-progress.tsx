import { cn } from '../utils/cn';

type StepStatus = 'waiting' | 'in-progress' | 'complete' | 'skipped';

interface StatusProgressStep {
  label: string;
  status: StepStatus;
}

interface StatusProgressProps {
  steps: StatusProgressStep[];
  className?: string;
}

function StatusProgress({ steps, className }: StatusProgressProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {/* Progress bar segments */}
      <div className="flex gap-1 h-1">
        {steps.map((step, i) => (
          <div
            key={i}
            className={cn(
              'flex-1 rounded-full transition-colors',
              step.status === 'complete' && 'bg-accent',
              step.status === 'in-progress' && 'bg-accent animate-pulse',
              step.status === 'waiting' && 'bg-surface-lighter',
              step.status === 'skipped' && 'bg-surface-lighter',
            )}
          />
        ))}
      </div>
      {/* Labels */}
      <div className="flex">
        {steps.map((step, i) => (
          <div key={i} className="flex-1 text-center">
            <span
              className={cn(
                'text-[11px] tracking-[-0.11px]',
                step.status === 'complete' && 'text-accent',
                step.status === 'in-progress' && 'text-text',
                step.status === 'waiting' && 'text-text-muted',
                step.status === 'skipped' && 'text-text-muted line-through',
              )}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export { StatusProgress };
export type { StatusProgressProps, StatusProgressStep, StepStatus };
