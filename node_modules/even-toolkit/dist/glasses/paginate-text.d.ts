/**
 * Text pagination utilities for G2 glasses display.
 *
 * Word-wraps text into lines, groups lines into pages, and generates
 * page indicators — useful for any app that shows multi-page text content.
 *
 * Usage:
 *   import { wordWrap, paginateText, pageIndicator } from 'even-toolkit/paginate-text';
 *
 *   const lines = wordWrap(longText, 46);
 *   const pages = paginateText(longText, 46, 9);
 *   const label = pageIndicator(2, pages.length);  // "Page 3/15"
 */
/**
 * Word-wrap text to a maximum line length, breaking at word boundaries.
 * Long words that exceed maxLen are force-split.
 *
 * @param text      The text to wrap
 * @param maxLen    Maximum characters per line (default 46 — fits G2 display)
 * @returns         Array of wrapped lines
 */
export declare function wordWrap(text: string, maxLen?: number): string[];
/**
 * Paginate text into pages of fixed line count.
 * First word-wraps, then groups into pages.
 *
 * @param text          The text to paginate
 * @param charsPerLine  Max characters per line (default 46)
 * @param linesPerPage  Lines per page (default 9)
 * @returns             Array of pages, each page is an array of line strings
 */
export declare function paginateText(text: string, charsPerLine?: number, linesPerPage?: number): string[][];
/**
 * Generate a page indicator string, e.g. "Page 3/15".
 *
 * @param currentIndex  Zero-based current page index
 * @param totalPages    Total number of pages
 * @returns             Human-readable page indicator
 */
export declare function pageIndicator(currentIndex: number, totalPages: number): string;
//# sourceMappingURL=paginate-text.d.ts.map