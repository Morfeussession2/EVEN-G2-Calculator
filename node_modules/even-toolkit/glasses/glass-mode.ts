/**
 * Mode encoding for G2 glasses navigation.
 *
 * Packs a mode identifier + offset into a single highlightedIndex number.
 * E.g. { buttons: 0, read: 100, links: 200 } means:
 *   - index 0-99: buttons mode, offset = index
 *   - index 100-199: read mode, offset = index - 100
 *   - index 200+: links mode, offset = index - 200
 */

export interface ModeEncoder<M extends string> {
  /** Encode a mode + offset into a single highlightedIndex value */
  encode(mode: M, offset?: number): number;
  /** Decode an index back to { mode, offset } */
  decode(index: number): { mode: M; offset: number };
  /** Get just the mode name from an encoded index */
  getMode(index: number): M;
  /** Get just the offset from an encoded index */
  getOffset(index: number): number;
  /** Get the base value for a mode */
  getBase(mode: M): number;
}

/**
 * Create a mode encoder from a mapping of mode names to base values.
 * Modes are matched by checking the index against bases in descending order.
 *
 * @param modes Record mapping mode names to their base values.
 *              All bases must be unique non-negative integers.
 *              E.g. { buttons: 0, scroll: 100, steps: 200 }
 */
export function createModeEncoder<M extends string>(
  modes: Record<M, number>,
): ModeEncoder<M> {
  // Sort entries by base value descending for decode matching
  const entries = (Object.entries(modes) as [M, number][])
    .sort((a, b) => b[1] - a[1]);

  function decode(index: number): { mode: M; offset: number } {
    for (const [mode, base] of entries) {
      if (index >= base) {
        return { mode, offset: index - base };
      }
    }
    // Fallback to the lowest base mode
    const last = entries[entries.length - 1]!;
    return { mode: last[0], offset: index - last[1] };
  }

  return {
    encode(mode: M, offset = 0): number {
      return modes[mode] + offset;
    },
    decode,
    getMode(index: number): M {
      return decode(index).mode;
    },
    getOffset(index: number): number {
      return decode(index).offset;
    },
    getBase(mode: M): number {
      return modes[mode];
    },
  };
}
