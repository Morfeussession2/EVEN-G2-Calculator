/**
 * Display composition utilities for G2 glasses.
 * Builds common screen layouts: scrollable lists, scrollable content with headers.
 */

import type { DisplayLine, DisplayData } from './types';
import { line, glassHeader } from './types';
import { applyScrollIndicators } from './text-utils';

/** G2 display fits 10 lines of text */
export const G2_TEXT_LINES = 10;

/** glassHeader() produces 2 DisplayLines that occupy 3 visual lines (title + separator + gap) */
export const HEADER_LINES = 3;

/** Default content slots below a glassHeader */
export const DEFAULT_CONTENT_SLOTS = G2_TEXT_LINES - HEADER_LINES;

/**
 * Calculate the start index for a centered sliding window.
 * Keeps the highlighted item roughly centered in the visible area.
 */
export function slidingWindowStart(
  highlightedIndex: number,
  totalItems: number,
  maxVisible: number,
): number {
  if (totalItems <= maxVisible) return 0;
  return Math.max(0, Math.min(
    highlightedIndex - Math.floor(maxVisible / 2),
    totalItems - maxVisible,
  ));
}

export interface ScrollableListOptions<T> {
  items: T[];
  highlightedIndex: number;
  maxVisible: number;
  /** Format an item into a display string */
  formatter: (item: T, index: number) => string;
  /** Line style for list items. Default: 'normal' */
  style?: 'normal' | 'meta';
}

/**
 * Build a scrollable highlighted list with ▲/▼ scroll indicators.
 * Returns an array of DisplayLines ready to use as DisplayData.lines.
 */
export function buildScrollableList<T>(opts: ScrollableListOptions<T>): DisplayLine[] {
  const { items, highlightedIndex, maxVisible, formatter, style = 'normal' } = opts;

  const start = slidingWindowStart(highlightedIndex, items.length, maxVisible);
  const visible = items.slice(start, start + maxVisible).map((item, i) => {
    const idx = start + i;
    return line(formatter(item, idx), style, idx === highlightedIndex);
  });

  applyScrollIndicators(visible, start, items.length, maxVisible, (t) => line(t, 'meta', false));

  return visible;
}

export interface ScrollableContentOptions {
  title: string;
  actionBar: string;
  contentLines: string[];
  scrollPos: number;
  /** Number of visible content lines. Default: DEFAULT_CONTENT_SLOTS (7) */
  contentSlots?: number;
  /** Style for content lines. Default: 'meta' */
  contentStyle?: 'normal' | 'meta';
}

/**
 * Build a header + windowed content display with scroll indicators.
 * Produces a complete DisplayData with glassHeader at the top,
 * followed by a scrollable window of content lines.
 */
export function buildScrollableContent(opts: ScrollableContentOptions): DisplayData {
  const {
    title,
    actionBar,
    contentLines,
    scrollPos,
    contentSlots = DEFAULT_CONTENT_SLOTS,
    contentStyle = 'meta',
  } = opts;

  const lines = [...glassHeader(title, actionBar)];

  const start = Math.max(0, Math.min(scrollPos, contentLines.length - contentSlots));
  const visible = contentLines.slice(start, start + contentSlots);

  const contentDisplayLines: DisplayLine[] = [];
  for (const text of visible) {
    contentDisplayLines.push(line(text, contentStyle, false));
  }

  applyScrollIndicators(
    contentDisplayLines,
    start,
    contentLines.length,
    contentSlots,
    (t) => line(t, 'meta', false),
  );

  lines.push(...contentDisplayLines);

  return { lines };
}
