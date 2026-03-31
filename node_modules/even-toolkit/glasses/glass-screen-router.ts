/**
 * Screen router for G2 glasses apps.
 *
 * Each screen is a self-contained module with display + action logic.
 * The router composes them into a single toDisplayData + onGlassAction pair
 * that switches on nav.screen automatically.
 *
 * @typeParam S  Snapshot type (app state)
 * @typeParam C  Context type for side effects (navigate, actions, etc.)
 */

import type { DisplayData, GlassNavState, GlassAction } from './types';

export interface GlassScreen<S, C> {
  /** Render the display for this screen */
  display: (snapshot: S, nav: GlassNavState) => DisplayData;
  /** Handle a glass action. ctx provides side effects like navigate. */
  action: (action: GlassAction, nav: GlassNavState, snapshot: S, ctx: C) => GlassNavState;
}

/**
 * Create a screen router from a map of screen definitions.
 *
 * @param screens  Record mapping screen names to their display + action handlers
 * @param fallback Screen name to use when nav.screen doesn't match any key
 */
export function createGlassScreenRouter<S, C>(
  screens: Record<string, GlassScreen<S, C>>,
  fallback: string,
) {
  const getScreen = (name: string): GlassScreen<S, C> => {
    return screens[name] ?? screens[fallback]!;
  };

  return {
    toDisplayData(snapshot: S, nav: GlassNavState): DisplayData {
      return getScreen(nav.screen).display(snapshot, nav);
    },
    onGlassAction(action: GlassAction, nav: GlassNavState, snapshot: S, ctx: C): GlassNavState {
      return getScreen(nav.screen).action(action, nav, snapshot, ctx);
    },
  };
}
