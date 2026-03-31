/**
 * Route-to-screen mapping utilities for G2 glasses.
 * Maps React Router URL paths to glasses screen names.
 */

import type { SplashHandle } from './splash';

export interface ScreenPattern {
  pattern: RegExp | string;
  screen: string;
}

/**
 * Create a deriveScreen function from a list of URL patterns.
 * Patterns are tested in order; first match wins.
 * String patterns are matched exactly. RegExp patterns use .test().
 *
 * @param patterns  Array of { pattern, screen } rules
 * @param fallback  Screen name to return if no pattern matches
 */
export function createScreenMapper(
  patterns: ScreenPattern[],
  fallback: string,
): (path: string) => string {
  return (path: string): string => {
    for (const { pattern, screen } of patterns) {
      if (typeof pattern === 'string') {
        if (path === pattern) return screen;
      } else {
        if (pattern.test(path)) return screen;
      }
    }
    return fallback;
  };
}

/**
 * Create a function that extracts an ID from a URL path.
 * @param pattern  RegExp with one capture group for the ID
 */
export function createIdExtractor(
  pattern: RegExp,
): (path: string) => string | null {
  return (path: string): string | null => {
    const match = path.match(pattern);
    return match ? match[1] ?? null : null;
  };
}

/**
 * Extract the first tile from a splash handle for home screen use.
 * Returns an array with a single tile, or empty if no tiles available.
 */
export function getHomeTiles(
  splash: SplashHandle,
): { id: number; name: string; bytes: Uint8Array; x: number; y: number; w: number; h: number }[] {
  const allTiles = splash.getTiles();
  return allTiles.length > 0 ? [allTiles[0]!] : [];
}
