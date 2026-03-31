import { cn } from '../utils/cn';

interface NavItem {
  id: string;
  label: string;
}

interface NavBarProps {
  items: NavItem[];
  activeId: string;
  onNavigate: (id: string) => void;
  className?: string;
}

function NavBar({ items, activeId, onNavigate, className }: NavBarProps) {
  return (
    <nav
      className={cn(
        'flex items-center gap-1 w-full box-border px-3 h-[52px] bg-surface rounded-b-[6px] overflow-x-auto scrollbar-hide',
        className,
      )}
    >
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onNavigate(item.id)}
          className={cn(
            'px-3 text-[17px] tracking-[-0.17px] font-normal cursor-pointer transition-colors whitespace-nowrap',
            activeId === item.id
              ? 'text-accent'
              : 'text-text-dim hover:text-text',
          )}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}

export { NavBar };
export type { NavBarProps, NavItem };
