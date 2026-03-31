import { cn } from '../utils/cn';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  onPrev?: () => void;
  onNext?: () => void;
  prevLabel?: string;
  nextLabel?: string;
  className?: string;
}

function StepIndicator({
  currentStep,
  totalSteps,
  onPrev,
  onNext,
  prevLabel = 'Previous',
  nextLabel,
  className,
}: StepIndicatorProps) {
  const isFirst = currentStep <= 1;
  const isLast = currentStep >= totalSteps;
  const resolvedNextLabel = nextLabel ?? (isLast ? 'Finish' : 'Next');

  return (
    <div className={cn('flex items-center justify-between gap-4', className)}>
      <button
        type="button"
        onClick={onPrev}
        disabled={isFirst || !onPrev}
        className="h-9 px-4 rounded-[6px] text-[15px] tracking-[-0.15px] font-normal text-text-dim hover:text-text hover:bg-surface-light transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
      >
        {prevLabel}
      </button>
      <span className="text-[13px] tracking-[-0.13px] text-text-dim tabular-nums">
        Step {currentStep} of {totalSteps}
      </span>
      <button
        type="button"
        onClick={onNext}
        disabled={!onNext}
        className="h-9 px-4 rounded-[6px] text-[15px] tracking-[-0.15px] font-normal bg-accent text-text-highlight hover:opacity-90 transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
      >
        {resolvedNextLabel}
      </button>
    </div>
  );
}

export { StepIndicator };
export type { StepIndicatorProps };
