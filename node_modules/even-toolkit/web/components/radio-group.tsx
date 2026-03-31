import { cn } from '../utils/cn';

interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps {
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  direction?: 'horizontal' | 'vertical';
  disabled?: boolean;
  className?: string;
}

function RadioGroup({ options, value, onChange, direction = 'vertical', disabled, className }: RadioGroupProps) {
  return (
    <div
      role="radiogroup"
      className={cn(
        'flex gap-3',
        direction === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
        disabled && 'opacity-50 pointer-events-none',
        className,
      )}
    >
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <label
            key={opt.value}
            className="inline-flex items-center gap-3 cursor-pointer select-none"
          >
            <button
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              onClick={() => onChange(opt.value)}
              className={cn(
                'relative shrink-0 w-5 h-5 rounded-full border-2 transition-colors cursor-pointer',
                selected ? 'border-accent' : 'border-surface-lighter',
              )}
            >
              {selected && (
                <span className="absolute inset-[4px] rounded-full bg-accent" />
              )}
            </button>
            <span className="text-[15px] tracking-[-0.15px] text-text">{opt.label}</span>
          </label>
        );
      })}
    </div>
  );
}

export { RadioGroup };
export type { RadioGroupProps, RadioOption };
