import type { DisplayData, GlassAction, GlassNavState, ColumnData } from './types';
import { type ColumnConfig } from './bridge';
import type { SplashHandle } from './splash';
export interface UseGlassesConfig<S> {
    getSnapshot: () => S;
    /** Convert snapshot to single text display (for 'text' mode) */
    toDisplayData: (snapshot: S, nav: GlassNavState) => DisplayData;
    /** Convert snapshot to column data (for 'columns' mode) — optional */
    toColumns?: (snapshot: S, nav: GlassNavState) => ColumnData;
    onGlassAction: (action: GlassAction, nav: GlassNavState, snapshot: S) => GlassNavState;
    deriveScreen: (path: string) => string;
    appName: string;
    /** Page mode per screen — return 'text', 'columns', or 'home'. Default: 'text' */
    getPageMode?: (screen: string) => 'text' | 'columns' | 'home';
    /** Column layout config — default: 3 equal columns across 576px */
    columns?: ColumnConfig[];
    /** Home page image tiles — sent when getPageMode returns 'home'. Create with createSplash().getTiles() */
    homeImageTiles?: {
        id: number;
        name: string;
        bytes: Uint8Array;
        x: number;
        y: number;
        w: number;
        h: number;
    }[];
    /**
     * Optional image-based splash screen.
     * When provided, shows the splash image instead of the default text splash,
     * then waits minTimeMs before switching to app content.
     * Create with `createSplash()` from 'even-toolkit/splash'.
     */
    splash?: SplashHandle;
}
export declare function useGlasses<S>(config: UseGlassesConfig<S>): void;
//# sourceMappingURL=useGlasses.d.ts.map