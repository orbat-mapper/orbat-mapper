const RADIUS = 6_378_137;
const HALF_SIZE = Math.PI * RADIUS;

export function lonLatToMercator(lonLat: readonly number[]): [number, number] {
  const [lon, lat] = lonLat;
  const x = (lon * HALF_SIZE) / 180;
  const y = Math.log(Math.tan(((90 + lat) * Math.PI) / 360)) * RADIUS;
  return [x, y];
}

export function mercatorToLonLat(xy: readonly number[]): [number, number] {
  const [x, y] = xy;
  const lon = (x * 180) / HALF_SIZE;
  const lat = (2 * Math.atan(Math.exp(y / RADIUS)) - Math.PI / 2) * (180 / Math.PI);
  return [lon, lat];
}

export function transformExtent3857To4326(
  extent: [number, number, number, number],
): [number, number, number, number] {
  const [minLon, minLat] = mercatorToLonLat([extent[0], extent[1]]);
  const [maxLon, maxLat] = mercatorToLonLat([extent[2], extent[3]]);
  return [minLon, minLat, maxLon, maxLat];
}
