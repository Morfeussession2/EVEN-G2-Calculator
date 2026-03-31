/**
 * Splash screen system for G2 glasses apps.
 *
 * Renders a canvas-based splash image to G2 image tiles with configurable
 * timing, tile layout, custom positioning, and a render callback.
 *
 * Usage:
 *   const splash = createSplash({
 *     render: (ctx, w, h) => {
 *       ctx.fillStyle = '#e0e0e0';
 *       ctx.font = 'bold 16px monospace';
 *       ctx.textAlign = 'center';
 *       ctx.fillText('MyApp', w/2, h/2);
 *     },
 *     tiles: 1,
 *     minTimeMs: 2000,
 *   });
 *
 *   // In useGlasses config:
 *   useGlasses({ ..., splash });
 */
export interface TilePosition {
    /** X position on the G2 display (0-576). Default: auto from tile index */
    x: number;
    /** Y position on the G2 display (0-288). Default: 0 */
    y: number;
    /** Tile width. Default: 200 (G2_IMAGE_MAX_W) */
    w?: number;
    /** Tile height. Default: 100 (G2_IMAGE_MAX_H) */
    h?: number;
}
export interface SplashConfig {
    /**
     * Render callback — draw your splash on the provided canvas context.
     * The canvas is pre-filled with black.
     *
     * @param ctx  Canvas 2D context
     * @param w    Canvas width in pixels
     * @param h    Canvas height in pixels
     */
    render: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
    /**
     * Number of image tiles to use (1-3).
     * - 1: single 200x100 tile
     * - 2: 400x100 across 2 tiles (horizontal) or 200x200 (vertical)
     * - 3: 576x100 across 3 tiles (full width)
     * Default: 1
     */
    tiles?: 1 | 2 | 3;
    /**
     * Tile layout direction.
     * - 'horizontal': tiles placed side-by-side (default)
     * - 'vertical': tiles stacked top-to-bottom
     */
    tileLayout?: 'horizontal' | 'vertical';
    /**
     * Custom tile positions on the G2 display.
     * Override where each tile is placed. Array length must match `tiles` count.
     *
     * Example — center a single tile:
     *   tilePositions: [{ x: 188, y: 94 }]  // centered on 576x288
     *
     * Example — 2 tiles stacked vertically:
     *   tilePositions: [{ x: 0, y: 0 }, { x: 0, y: 100 }]
     *
     * Default: tiles placed side-by-side at y=0 (standard layout)
     */
    tilePositions?: TilePosition[];
    /**
     * Canvas size override. By default: (tiles * 200) x 100 for horizontal,
     * 200 x (tiles * 100) for vertical.
     * Use this when you need a different aspect ratio or resolution.
     */
    canvasSize?: {
        w: number;
        h: number;
    };
    /**
     * Minimum time the splash should be visible (ms).
     * `waitMinTime()` will delay until this time has passed since `show()`.
     * Default: 2000
     */
    minTimeMs?: number;
    /**
     * Maximum time before the splash is forcefully dismissed (ms).
     * Set to 0 for no max. Default: 5000
     */
    maxTimeMs?: number;
    /**
     * Menu text shown below the image (in the text container).
     * Default: empty string (hidden)
     */
    menuText?: string;
}
export interface SplashHandle {
    /** Show the splash on the glasses. Returns when the image is sent. */
    show: (bridge: SplashBridge) => Promise<void>;
    /** Wait until minTimeMs has elapsed since show(). Resolves immediately if already elapsed. */
    waitMinTime: () => Promise<void>;
    /** Clear extra splash tiles (send black). Call after waitMinTime for seamless transition. */
    clearExtras: (bridge: SplashBridge) => Promise<void>;
    /** Check if the splash is currently showing. */
    isShowing: () => boolean;
    /** Get encoded tile data (for apps that manage their own bridge). */
    getTiles: () => {
        id: number;
        name: string;
        bytes: Uint8Array;
        x: number;
        y: number;
        w: number;
        h: number;
    }[];
}
/** Minimal bridge interface needed for splash (subset of EvenHubBridge). */
export interface SplashBridge {
    showHomePage: (menuText: string, imageTiles?: {
        id: number;
        name: string;
        x: number;
        y: number;
        w: number;
        h: number;
    }[]) => Promise<void>;
    sendImage: (containerId: number, containerName: string, pngBytes: Uint8Array) => Promise<void>;
}
/**
 * Preset tile positions for common layouts.
 */
export declare const TILE_PRESETS: {
    /** Single tile centered on the G2 display */
    centered1: TilePosition[];
    /** Single tile top-center */
    topCenter1: TilePosition[];
    /** 2 tiles side-by-side, centered vertically */
    centered2: TilePosition[];
    /** 2 tiles stacked vertically, centered horizontally, near top */
    topCenterVertical2: TilePosition[];
    /** 3 tiles full width at top */
    fullWidthTop: TilePosition[];
    /** Default: standard side-by-side at y=0 */
    default: undefined;
};
export declare function createSplash(config: SplashConfig): SplashHandle;
//# sourceMappingURL=splash.d.ts.map