import { cn } from '../utils/cn';
import { Children, cloneElement, isValidElement } from 'react';
import type { ReactNode } from 'react';

interface InputGroupProps {
  children: ReactNode;
  className?: string;
}

function InputGroup({ children, className }: InputGroupProps) {
  const items = Children.toArray(children).filter(isValidElement);
  const count = items.length;

  return (
    <div className={cn('flex items-stretch', className)}>
      {items.map((child, i) => {
        const isFirst = i === 0;
        const isLast = i === count - 1;
        const radius = isFirst
          ? '6px 0 0 6px'
          : isLast
            ? '0 6px 6px 0'
            : '0';
        const props = child.props as Record<string, unknown>;
        const existingStyle = (props.style ?? {}) as Record<string, unknown>;
        return cloneElement(child, {
          style: {
            ...existingStyle,
            borderRadius: radius,
            ...(isFirst ? {} : { borderLeft: 'none' }),
          },
        } as Record<string, unknown>);
      })}
    </div>
  );
}

export { InputGroup };
export type { InputGroupProps };
