import { cn } from '../utils/cn';
import { useState, useEffect } from 'react';

interface LoadingProps {
  size?: number;
  className?: string;
}

/*
 * Pixel-art loading spinner — progressive cell-by-cell fill on a 4×4 grid.
 * Quadrant order: BL → BR → TR → TL (clockwise from bottom-left).
 * Within each quadrant, cells follow the clockwise sweep direction
 * so adjacent pixels fill sequentially — no visual jumps.
 * 32 frames: 16 fill + 16 empty, 50ms each = ~1.6s cycle.
 */

const fillOrder: [number, number][] = [
  // BL: column-by-column left→right, top→bottom
  [2, 0], [3, 0], [2, 1], [3, 1],
  // BR: column-by-column left→right, top→bottom
  [2, 2], [3, 2], [2, 3], [3, 3],
  // TR: column-by-column right→left, bottom→top (reverse — continuing clockwise)
  [1, 3], [0, 3], [1, 2], [0, 2],
  // TL: column-by-column right→left, bottom→top (reverse — continuing clockwise)
  [1, 1], [0, 1], [1, 0], [0, 0],
];

const N = 16;
const TOTAL = N * 2;

function Loading({ size = 24, className }: LoadingProps) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setFrame((f) => (f + 1) % TOTAL);
    }, 50);
    return () => clearInterval(id);
  }, []);

  const filling = frame < N;
  const t = filling ? frame : frame - N;

  const cellSize = 2;
  const viewSize = 8;

  return (
    <div
      className={cn('inline-flex items-center justify-center', className)}
      style={{ width: Math.max(size, 8), height: Math.max(size, 8) }}
    >
      <svg
        width={Math.max(size, 8)}
        height={Math.max(size, 8)}
        viewBox={`0 0 ${viewSize} ${viewSize}`}
        shapeRendering="crispEdges"
      >
        {fillOrder.map(([r, c], i) => {
          const on = filling ? i <= t : i > t;
          return (
            <rect
              key={i}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize}
              height={cellSize}
              fill="currentColor"
              opacity={on ? 1 : 0}
              style={{ transition: 'opacity 40ms ease' }}
            />
          );
        })}
      </svg>
    </div>
  );
}

export { Loading };
export type { LoadingProps };
