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
import { G2_IMAGE_MAX_W, G2_IMAGE_MAX_H, DISPLAY_W, DISPLAY_H, IMAGE_TILES } from './layout';
import { encodeTilesBatch } from './png-utils';
/**
 * Preset tile positions for common layouts.
 */
export const TILE_PRESETS = {
    /** Single tile centered on the G2 display */
    centered1: [
        { x: Math.floor((DISPLAY_W - G2_IMAGE_MAX_W) / 2), y: Math.floor((DISPLAY_H - G2_IMAGE_MAX_H) / 2) },
    ],
    /** Single tile top-center */
    topCenter1: [
        { x: Math.floor((DISPLAY_W - G2_IMAGE_MAX_W) / 2), y: 20 },
    ],
    /** 2 tiles side-by-side, centered vertically */
    centered2: [
        { x: Math.floor((DISPLAY_W - 400) / 2), y: Math.floor((DISPLAY_H - G2_IMAGE_MAX_H) / 2) },
        { x: Math.floor((DISPLAY_W - 400) / 2) + G2_IMAGE_MAX_W, y: Math.floor((DISPLAY_H - G2_IMAGE_MAX_H) / 2) },
    ],
    /** 2 tiles stacked vertically, centered horizontally, near top */
    topCenterVertical2: [
        { x: Math.floor((DISPLAY_W - G2_IMAGE_MAX_W) / 2), y: 20 },
        { x: Math.floor((DISPLAY_W - G2_IMAGE_MAX_W) / 2), y: 20 + G2_IMAGE_MAX_H },
    ],
    /** 3 tiles full width at top */
    fullWidthTop: [
        { x: 0, y: 0 },
        { x: G2_IMAGE_MAX_W, y: 0 },
        { x: G2_IMAGE_MAX_W * 2, y: 0 },
    ],
    /** Default: standard side-by-side at y=0 */
    default: undefined,
};
export function createSplash(config) {
    const tileCount = config.tiles ?? 1;
    const minTime = config.minTimeMs ?? 2000;
    const maxTime = config.maxTimeMs ?? 5000;
    const menuText = config.menuText ?? '';
    const positions = config.tilePositions;
    const vertical = config.tileLayout === 'vertical';
    const tileW = G2_IMAGE_MAX_W; // 200
    const tileH = G2_IMAGE_MAX_H; // 100
    const canvasW = config.canvasSize?.w ?? (vertical ? tileW : tileCount * tileW);
    const canvasH = config.canvasSize?.h ?? (vertical ? tileCount * tileH : tileH);
    let showTime = 0;
    let showing = false;
    let encodedTiles = [];
    function renderAndEncode() {
        const canvas = document.createElement('canvas');
        canvas.width = canvasW;
        canvas.height = canvasH;
        const ctx = canvas.getContext('2d');
        // Black background
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvasW, canvasH);
        // App-specific rendering
        config.render(ctx, canvasW, canvasH);
        // Encode each tile
        encodedTiles = [];
        for (let i = 0; i < tileCount; i++) {
            const slot = IMAGE_TILES[i];
            const pos = positions?.[i];
            const cropX = vertical ? 0 : i * tileW;
            const cropY = vertical ? i * tileH : 0;
            const cropW = Math.min(tileW, canvasW - cropX);
            const cropH = Math.min(tileH, canvasH - cropY);
            const crop = { sx: cropX, sy: cropY, sw: cropW, sh: cropH };
            const enc = encodeTilesBatch(canvas, [{ crop, name: slot.name }], tileW, tileH)[0];
            encodedTiles.push({
                id: slot.id,
                name: slot.name,
                bytes: enc.bytes,
                x: pos?.x ?? slot.x,
                y: pos?.y ?? slot.y,
                w: pos?.w ?? tileW,
                h: pos?.h ?? tileH,
            });
        }
        // Fill remaining tiles with black
        if (tileCount < 3) {
            const black = document.createElement('canvas');
            black.width = tileW;
            black.height = tileH;
            const bctx = black.getContext('2d');
            bctx.fillStyle = '#000000';
            bctx.fillRect(0, 0, tileW, tileH);
            const blackEnc = encodeTilesBatch(black, [{ crop: { sx: 0, sy: 0, sw: tileW, sh: tileH }, name: 'black' }], tileW, tileH)[0];
            for (let i = tileCount; i < 3; i++) {
                const slot = IMAGE_TILES[i];
                encodedTiles.push({
                    id: slot.id,
                    name: slot.name,
                    bytes: blackEnc.bytes,
                    x: slot.x,
                    y: slot.y,
                    w: tileW,
                    h: tileH,
                });
            }
        }
    }
    return {
        async show(bridge) {
            renderAndEncode();
            showTime = Date.now();
            showing = true;
            // Show the home layout with all image tiles
            const imageTiles = encodedTiles
                .filter((_, i) => i < tileCount)
                .map(t => ({ id: t.id, name: t.name, x: t.x, y: t.y, w: t.w, h: t.h }));
            await bridge.showHomePage(menuText, imageTiles);
            // Send only the app tiles (not black padding tiles)
            for (let i = 0; i < tileCount; i++) {
                const tile = encodedTiles[i];
                await bridge.sendImage(tile.id, tile.name, tile.bytes);
            }
            // Auto-dismiss after maxTime
            if (maxTime > 0) {
                setTimeout(() => { showing = false; }, maxTime);
            }
        },
        async waitMinTime() {
            const elapsed = Date.now() - showTime;
            if (elapsed < minTime) {
                await new Promise((r) => setTimeout(r, minTime - elapsed));
            }
            showing = false;
        },
        async clearExtras(bridge) {
            // Send black tiles for any extra splash tiles (e.g. tile 2 "Loading...")
            // so they don't linger when transitioning to the home screen with fewer tiles.
            if (encodedTiles.length === 0)
                return;
            const black = document.createElement('canvas');
            black.width = tileW;
            black.height = tileH;
            const bctx = black.getContext('2d');
            bctx.fillStyle = '#000000';
            bctx.fillRect(0, 0, tileW, tileH);
            const blackEnc = encodeTilesBatch(black, [{ crop: { sx: 0, sy: 0, sw: tileW, sh: tileH }, name: 'black' }], tileW, tileH)[0];
            // Clear tiles beyond what the home screen uses (tile index 1+ for vertical 2-tile splash)
            for (let i = 1; i < encodedTiles.length; i++) {
                const tile = encodedTiles[i];
                await bridge.sendImage(tile.id, tile.name, blackEnc.bytes);
            }
        },
        isShowing() {
            return showing;
        },
        getTiles() {
            if (encodedTiles.length === 0)
                renderAndEncode();
            return encodedTiles;
        },
    };
}
//# sourceMappingURL=splash.js.map