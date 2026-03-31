import { cn } from '../utils/cn';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

function Checkbox({ checked, onChange, label, disabled, className }: CheckboxProps) {
  return (
    <label
      className={cn(
        'inline-flex items-center gap-3 cursor-pointer select-none',
        disabled && 'opacity-50 pointer-events-none',
        className,
      )}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative shrink-0 w-5 h-5 rounded-[4px] transition-colors cursor-pointer',
          checked ? 'bg-accent' : 'bg-surface-lighter',
        )}
      >
        {checked && (
          <svg
            viewBox="0 0 12 12"
            className="absolute inset-0 w-full h-full p-0.5"
            fill="none"
          >
            <rect x={2} y={5} width={2} height={2} fill="var(--color-text-highlight)" />
            <rect x={4} y={7} width={2} height={2} fill="var(--color-text-highlight)" />
            <rect x={6} y={5} width={2} height={2} fill="var(--color-text-highlight)" />
            <rect x={8} y={3} width={2} height={2} fill="var(--color-text-highlight)" />
          </svg>
        )}
      </button>
      {label && (
        <span className="text-[15px] tracking-[-0.15px] text-text">{label}</span>
      )}
    </label>
  );
}

export { Checkbox };
export type { CheckboxProps };
