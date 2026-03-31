import { cn } from '../utils/cn';

interface StatItem {
  label: string;
  value: string | number;
  detail?: string;
}

interface StatGridProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4;
  className?: string;
}

function StatGrid({ stats, columns = 3, className }: StatGridProps) {
  return (
    <div
      className={cn(
        'grid gap-3',
        columns === 2 && 'grid-cols-2',
        columns === 3 && 'grid-cols-3',
        columns === 4 && 'grid-cols-4',
        className,
      )}
    >
      {stats.map((stat, i) => (
        <div key={i} className="bg-surface rounded-[6px] p-3 text-center">
          <div className="text-[24px] tracking-[-0.72px] font-normal text-accent tabular-nums">{stat.value}</div>
          <div className="text-[13px] tracking-[-0.13px] text-text-dim mt-0.5">{stat.label}</div>
          {stat.detail && (
            <div className="text-[11px] tracking-[-0.11px] text-text-muted mt-0.5">{stat.detail}</div>
          )}
        </div>
      ))}
    </div>
  );
}

export { StatGrid };
export type { StatGridProps, StatItem };
