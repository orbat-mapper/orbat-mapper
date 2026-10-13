/** How a DEM tile packs a height into the colour channels of a pixel. */
export type DemEncoding = "terrarium" | "mapbox";

/** Reads an encoding field, defaulting to Terrarium as MapLibre does. */
export function demEncoding(value: unknown): DemEncoding {
  return value === "mapbox" ? "mapbox" : "terrarium";
}

/** Converts RGBA pixels of a DEM tile to heights in metres, one per pixel. Takes
 *  raw pixels rather than an image so it runs without a canvas. */
export function decodeDem(rgba: ArrayLike<number>, encoding: DemEncoding): Float32Array {
  const heights = new Float32Array(Math.floor(rgba.length / 4));
  for (let i = 0; i < heights.length; i++) {
    const r = rgba[i * 4]!;
    const g = rgba[i * 4 + 1]!;
    const b = rgba[i * 4 + 2]!;
    heights[i] =
      encoding === "terrarium"
        ? r * 256 + g + b / 256 - 32768
        : (r * 65536 + g * 256 + b) * 0.1 - 10000;
  }
  return heights;
}
