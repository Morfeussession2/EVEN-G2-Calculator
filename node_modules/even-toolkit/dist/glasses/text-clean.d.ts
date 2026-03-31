/**
 * Text cleaning utilities for G2 glasses display.
 *
 * The G2 supports basic Latin, Latin-1 Supplement, and common symbols.
 * These helpers strip emojis, unsupported Unicode, and normalize whitespace
 * so text renders cleanly on the monospace G2 display.
 *
 * Usage:
 *   import { cleanForG2, normalizeWhitespace } from 'even-toolkit/text-clean';
 *   const safe = cleanForG2('Hello 🌍 World!');  // "Hello World!"
 */
/**
 * Clean text for safe rendering on the G2 glasses display.
 * Strips emojis, unsupported Unicode characters, and normalizes whitespace.
 */
export declare function cleanForG2(text: string): string;
/**
 * Normalize whitespace only (collapse multiple spaces/newlines, trim).
 * Does not strip Unicode — use when the text source is already safe.
 */
export declare function normalizeWhitespace(text: string): string;
//# sourceMappingURL=text-clean.d.ts.map