/**
 * Unicode timer display for G2 glasses.
 *
 * Confirmed working on G2:  █ (full block), ─ (box drawing horizontal)
 * NOT working on G2:  ░ ▒ ▓ (shading), ╔═╗║ (double box drawing), ▀▄ (half blocks)
 *
 * Renders as 2 lines — text centered using ─ padding to match bar width:
 *      ─────── ▶  06:44 ───────
 *      ████████████────────────
 */
export interface TimerState {
    running: boolean;
    remaining: number;
    total: number;
}
/**
 * Render a 2-line timer display for the G2 glasses.
 * Line 1: ─── icon  MM:SS ─── (centered with ─ filler, same visual width as bar)
 * Line 2: ████████████──────── (progress bar)
 *
 * @param timer    Current timer state
 * @param barWidth Number of characters for the progress bar (default 24)
 */
export declare function renderTimerLines(timer: TimerState, barWidth?: number): string[];
/**
 * Render a single-line compact timer (for tight spaces).
 */
export declare function renderTimerCompact(timer: TimerState): string;
//# sourceMappingURL=timer-display.d.ts.map