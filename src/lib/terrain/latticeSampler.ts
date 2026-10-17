import { EARTH_RADIUS, type ElevationSampler, type LngLat } from "./index";

const RAD = Math.PI / 180;

/**
 * A sampler over ground shaped by `height`, whose DEM pixels sit on a fixed
 * lattice `spacing` metres apart near 50° N, as a real DEM's pixels sit
 * wherever a search is centred: the square block of them around a circle, on
 * a lattice twice, four times… as coarse where it is wider than `maxAcross`.
 */
export function latticeSampler(height: (position: LngLat) => number, spacing = 1) {
  const sampler: ElevationSampler = {
    sample: async (positions) => positions.map(height),
    heights: async (positions) => Float64Array.from(positions, height),
    finestResolution: () => spacing,
    async pixelsAround(center, radius, { maxAcross }) {
      let step = spacing;
      while ((2 * radius) / step > maxAcross) step *= 2;
      const dLat = step / (EARTH_RADIUS * RAD);
      const dLng = dLat / Math.cos(50 * RAD);
      const positions: LngLat[] = [];
      const span = Math.ceil(radius / step);
      const column0 = Math.round(center[0] / dLng);
      const row0 = Math.round(center[1] / dLat);
      // North to south, each row west to east.
      for (let row = row0 + span; row >= row0 - span; row--)
        for (let column = column0 - span; column <= column0 + span; column++)
          positions.push([column * dLng, row * dLat]);
      return {
        width: 2 * span + 1,
        positions,
        heights: Float64Array.from(positions, height),
        resolution: step,
      };
    },
  };
  return sampler;
}
