import * as React from 'react';
import { cn } from '../utils/cn';
import { IcGuideSearch } from '../icons/svg-icons';

interface SearchBarProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
}

const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  ({ className, placeholder = 'Search...', ...props }, ref) => (
    <div className={cn('relative', className)}>
      <IcGuideSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-dim pointer-events-none" />
      <input
        ref={ref}
        type="search"
        placeholder={placeholder}
        className="h-9 w-full bg-input-bg text-text rounded-[6px] pl-11 pr-4 text-[17px] tracking-[-0.17px] outline-none placeholder:text-text-dim transition-colors"
        {...props}
      />
    </div>
  ),
);

SearchBar.displayName = 'SearchBar';

export { SearchBar };
export type { SearchBarProps };
