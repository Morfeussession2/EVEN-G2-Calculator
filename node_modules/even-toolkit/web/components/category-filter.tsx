import { cn } from '../utils/cn';

interface CategoryFilterProps {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
  className?: string;
}

function CategoryFilter({ categories, selected, onSelect, className }: CategoryFilterProps) {
  return (
    <div className={cn('flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide', className)}>
      {categories.map((cat) => (
        <button
          key={cat}
          type="button"
          onClick={() => onSelect(cat)}
          className={cn(
            'shrink-0 rounded-[6px] px-4 py-2 text-[15px] tracking-[-0.15px] font-normal transition-colors cursor-pointer',
            selected === cat
              ? 'bg-accent text-text-highlight'
              : 'bg-surface-lighter text-text-dim hover:text-text',
          )}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

export { CategoryFilter };
export type { CategoryFilterProps };
