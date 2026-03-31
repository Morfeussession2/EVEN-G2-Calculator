/** PNG encoding: 16-color (4-bit) indexed PNG via UPNG — smallest possible files for G2. */
import UPNG from 'upng-js';
function fnv32a(bytes) {
    let hash = 0x811c9dc5;
    for (let i = 0; i < bytes.length; i++) {
        hash ^= bytes[i];
        hash = Math.imul(hash, 0x01000193);
    }
    return hash >>> 0;
}
// Cache tile canvases
const tileCanvasCache = new Map();
function getTileCtx(key, w, h) {
    let cached = tileCanvasCache.get(key);
    if (!cached || cached.canvas.width !== w || cached.canvas.height !== h) {
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        cached = { canvas, ctx: canvas.getContext('2d') };
        tileCanvasCache.set(key, cached);
    }
    return cached.ctx;
}
// Reusable RGBA buffer for UPNG encode
let rgbaBuf = null;
let rgbaBufSize = 0;
function getRgbaBuf(size) {
    if (!rgbaBuf || rgbaBufSize < size) {
        rgbaBuf = new Uint8Array(size);
        rgbaBufSize = size;
    }
    return rgbaBuf;
}
function encodeTile(canvas, sx, sy, sw, sh, tw, th, key) {
    const ctx = getTileCtx(key, tw, th);
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, tw, th);
    const dw = Math.min(sw, tw), dh = Math.min(sh, th);
    ctx.drawImage(canvas, sx, sy, dw, dh, 0, 0, dw, dh);
    const imgData = ctx.getImageData(0, 0, tw, th);
    const pixels = imgData.data;
    const pc = tw * th;
    // Quantize to 16-level greyscale for 4-bit indexed PNG
    const buf = getRgbaBuf(pc * 4);
    for (let i = 0; i < pc; i++) {
        const si = i * 4;
        const lum = Math.round(0.299 * pixels[si] + 0.587 * pixels[si + 1] + 0.114 * pixels[si + 2]);
        const idx = Math.min(15, Math.round(lum / 17));
        const v = idx * 17;
        buf[si] = v;
        buf[si + 1] = v;
        buf[si + 2] = v;
        buf[si + 3] = 255;
    }
    // 16-color indexed PNG
    const pngBuf = UPNG.encode([buf.buffer.slice(0, pc * 4)], tw, th, 16);
    const bytes = new Uint8Array(pngBuf);
    return { bytes, hash: fnv32a(bytes) };
}
/** Encode all tiles from a source canvas. */
export function encodeTilesBatch(canvas, tiles, tw, th) {
    return tiles.map((tile) => encodeTile(canvas, tile.crop.sx, tile.crop.sy, tile.crop.sw, tile.crop.sh, tw, th, tile.name));
}
/** Reset cache (no-op now, kept for API compat). */
export function resetTileCache() { }
/** Backward-compat: encode full canvas to PNG bytes (number[] for SDK). */
export async function canvasToPngBytes(canvas) {
    const w = canvas.width;
    const h = canvas.height;
    const tile = encodeTile(canvas, 0, 0, w, h, w, h, '__full');
    return Array.from(tile.bytes);
}
//# sourceMappingURL=png-utils.js.map