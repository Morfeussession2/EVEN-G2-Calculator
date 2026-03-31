import * as React from 'react';
import { cn } from '../utils/cn';
import {
  ResponsiveContainer,
  LineChart as RLineChart,
  Line,
  BarChart as RBarChart,
  Bar,
  PieChart as RPieChart,
  Pie,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Area,
  AreaChart,
} from 'recharts';

// ─── Colors ─────────────────────────────────────────────────────

const COLORS = ['#232323', '#4BB956', '#FF453A', '#FEF991', '#7B7B7B', '#E4E4E4'];

// ─── Custom Tooltip ─────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface rounded-[6px] shadow-[0_2px_8px_rgba(0,0,0,0.12)] px-3 py-2 text-[13px] tracking-[-0.13px]">
      {label != null && <div className="text-text-dim mb-1">{label}</div>}
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
          <span className="text-text tabular-nums">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Sparkline ──────────────────────────────────────────────────

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

function Sparkline({ data, width = 80, height = 24, color, className }: SparklineProps) {
  if (data.length < 2) return null;

  const chartData = data.map((value, index) => ({ index, value }));

  return (
    <div className={className} style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RLineChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color ?? 'var(--color-accent)'}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </RLineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── LineChart ───────────────────────────────────────────────────

interface LineChartPoint { x: number; y: number; label?: string; }

interface LineChartProps {
  data: LineChartPoint[];
  width?: number;
  height?: number;
  color?: string;
  showGrid?: boolean;
  showLabels?: boolean;
  showArea?: boolean;
  animated?: boolean;
  className?: string;
}

function LineChart({
  data, width = 300, height = 200, color,
  showGrid = true, showLabels = true, showArea = false,
  animated = false, className,
}: LineChartProps) {
  if (data.length < 2) return null;

  const accentColor = color ?? 'var(--color-accent)';
  const gradientId = React.useId();

  const chartData = data.map((d) => ({
    x: d.x,
    y: d.y,
    label: d.label ?? d.x,
  }));

  if (showArea) {
    return (
      <div className={cn('w-full', className)} style={{ width, height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, bottom: showLabels ? 0 : 10, left: showLabels ? 0 : 10 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={accentColor} stopOpacity={0.2} />
                <stop offset="100%" stopColor={accentColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            {showGrid && (
              <CartesianGrid
                strokeDasharray="4 4"
                stroke="var(--color-border)"
                strokeWidth={0.5}
                vertical={false}
              />
            )}
            {showLabels && (
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: 'var(--color-text-dim)' }}
                axisLine={false}
                tickLine={false}
              />
            )}
            {showLabels && (
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--color-text-dim)' }}
                axisLine={false}
                tickLine={false}
                width={36}
              />
            )}
            {!showLabels && <XAxis hide />}
            {!showLabels && <YAxis hide />}
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="y"
              stroke={accentColor}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              dot={{ r: 3, fill: accentColor, strokeWidth: 0 }}
              isAnimationActive={animated}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)} style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RLineChart data={chartData} margin={{ top: 10, right: 10, bottom: showLabels ? 0 : 10, left: showLabels ? 0 : 10 }}>
          {showGrid && (
            <CartesianGrid
              strokeDasharray="4 4"
              stroke="var(--color-border)"
              strokeWidth={0.5}
              vertical={false}
            />
          )}
          {showLabels && (
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: 'var(--color-text-dim)' }}
              axisLine={false}
              tickLine={false}
            />
          )}
          {showLabels && (
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--color-text-dim)' }}
              axisLine={false}
              tickLine={false}
              width={36}
            />
          )}
          {!showLabels && <XAxis hide />}
          {!showLabels && <YAxis hide />}
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="y"
            stroke={accentColor}
            strokeWidth={2}
            dot={{ r: 3, fill: accentColor, strokeWidth: 0 }}
            isAnimationActive={animated}
          />
        </RLineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── BarChart ───────────────────────────────────────────────────

interface BarChartItem { label: string; value: number; color?: string; }

interface BarChartProps {
  data: BarChartItem[];
  width?: number;
  height?: number;
  color?: string;
  horizontal?: boolean;
  showLabels?: boolean;
  className?: string;
}

function BarChart({
  data, width = 300, height = 200, color,
  horizontal = false, showLabels = true, className,
}: BarChartProps) {
  if (data.length === 0) return null;

  const defaultColor = color ?? 'var(--color-accent)';
  const hasCustomColors = data.some((d) => d.color);

  const chartData = data.map((d) => ({
    label: d.label,
    value: d.value,
    fill: d.color ?? defaultColor,
  }));

  if (horizontal) {
    return (
      <div className={cn('w-full', className)} style={{ width, height }}>
        <ResponsiveContainer width="100%" height="100%">
          <RBarChart data={chartData} layout="vertical" margin={{ top: 10, right: 10, bottom: 10, left: showLabels ? 40 : 10 }}>
            {showLabels && (
              <YAxis
                dataKey="label"
                type="category"
                tick={{ fontSize: 11, fill: 'var(--color-text-dim)' }}
                axisLine={false}
                tickLine={false}
                width={36}
              />
            )}
            {!showLabels && <YAxis type="category" hide />}
            {showLabels && (
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: 'var(--color-text-dim)' }}
                axisLine={false}
                tickLine={false}
              />
            )}
            {!showLabels && <XAxis type="number" hide />}
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} isAnimationActive={false}>
              {hasCustomColors && chartData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </RBarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)} style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RBarChart data={chartData} margin={{ top: 10, right: 10, bottom: showLabels ? 0 : 10, left: showLabels ? 0 : 10 }}>
          {showLabels && (
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: 'var(--color-text-dim)' }}
              axisLine={false}
              tickLine={false}
            />
          )}
          {!showLabels && <XAxis hide />}
          {showLabels && (
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--color-text-dim)' }}
              axisLine={false}
              tickLine={false}
              width={36}
            />
          )}
          {!showLabels && <YAxis hide />}
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" fill={defaultColor} radius={[4, 4, 0, 0]} isAnimationActive={false}>
            {hasCustomColors && chartData.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Bar>
        </RBarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── PieChart ───────────────────────────────────────────────────

interface PieChartItem { label: string; value: number; color?: string; }

interface PieChartProps {
  data: PieChartItem[];
  size?: number;
  donut?: boolean;
  centerLabel?: string;
  className?: string;
}

function PieChart({ data, size = 160, donut = false, centerLabel, className }: PieChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;

  const chartData = data.map((d, i) => ({
    name: d.label,
    value: d.value,
    fill: d.color ?? COLORS[i % COLORS.length],
  }));

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      <div className="relative" style={{ width: size, height: size, maxWidth: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RPieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={donut ? '55%' : 0}
              outerRadius="90%"
              paddingAngle={0}
              dataKey="value"
              strokeWidth={0}
              isAnimationActive={false}
            >
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </RPieChart>
        </ResponsiveContainer>
        {donut && centerLabel && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[17px] tracking-[-0.17px] font-normal">{centerLabel}</span>
          </div>
        )}
      </div>
      {/* Legend */}
      <div className="flex flex-col gap-1.5 w-full max-w-xs">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color ?? COLORS[i % COLORS.length] }} />
            <span className="text-[13px] tracking-[-0.13px] text-text">{item.label}</span>
            <span className="text-[11px] tracking-[-0.11px] text-text-dim ml-auto tabular-nums">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── StatCard ───────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  sparklineData?: number[];
  className?: string;
}

function StatCard({ label, value, change, trend, sparklineData, className }: StatCardProps) {
  return (
    <div className={cn('bg-surface rounded-[6px] p-4', className)}>
      <div className="text-[13px] tracking-[-0.13px] text-text-dim mb-1">{label}</div>
      <div className="flex items-end justify-between gap-2">
        <div>
          <div className="text-[24px] tracking-[-0.72px] font-normal tabular-nums">{value}</div>
          {change && (
            <span className={cn(
              'text-[13px] tracking-[-0.13px]',
              trend === 'up' && 'text-positive',
              trend === 'down' && 'text-negative',
              trend === 'neutral' && 'text-text-dim',
            )}>
              {trend === 'up' && '↑'}{trend === 'down' && '↓'} {change}
            </span>
          )}
        </div>
        {sparklineData && sparklineData.length > 1 && (
          <Sparkline
            data={sparklineData}
            width={64}
            height={24}
            color={trend === 'up' ? 'var(--color-positive)' : trend === 'down' ? 'var(--color-negative)' : undefined}
          />
        )}
      </div>
    </div>
  );
}

export { Sparkline, LineChart, BarChart, PieChart, StatCard };
export type { SparklineProps, LineChartProps, LineChartPoint, BarChartProps, BarChartItem, PieChartProps, PieChartItem, StatCardProps };
