/**
 * Navigation helpers for G2 glasses display.
 * Pure functions for cursor movement, index clamping, and scroll math.
 */

/** Convert gesture direction to numeric delta */
export function directionDelta(direction: 'up' | 'down'): -1 | 1 {
  return direction === 'up' ? -1 : 1;
}

/** Move a highlight index by one step, clamped to [0, max] */
export function moveHighlight(current: number, direction: 'up' | 'down', max: number): number {
  const next = current + directionDelta(direction);
  return Math.max(0, Math.min(max, next));
}

/** Clamp an index to a valid range [0, count - 1] */
export function clampIndex(index: number, count: number): number {
  return Math.min(Math.max(0, index), count - 1);
}

/** Calculate maximum scroll offset for windowed content */
export function calcMaxScroll(totalLines: number, visibleSlots: number): number {
  return Math.max(0, totalLines - visibleSlots);
}

/** Move an index with wrapping (loops around) */
export function wrapIndex(current: number, direction: 'up' | 'down', count: number): number {
  if (count <= 0) return 0;
  return (current + directionDelta(direction) + count) % count;
}
