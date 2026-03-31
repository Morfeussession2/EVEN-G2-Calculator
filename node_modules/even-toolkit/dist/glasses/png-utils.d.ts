export interface EncodedTile {
    bytes: Uint8Array;
    hash: number;
}
/** Encode all tiles from a source canvas. */
export declare function encodeTilesBatch(canvas: HTMLCanvasElement, tiles: Array<{
    crop: {
        sx: number;
        sy: number;
        sw: number;
        sh: number;
    };
    name: string;
}>, tw: number, th: number): EncodedTile[];
/** Reset cache (no-op now, kept for API compat). */
export declare function resetTileCache(): void;
/** Backward-compat: encode full canvas to PNG bytes (number[] for SDK). */
export declare function canvasToPngBytes(canvas: HTMLCanvasElement): Promise<number[]>;
//# sourceMappingURL=png-utils.d.ts.map