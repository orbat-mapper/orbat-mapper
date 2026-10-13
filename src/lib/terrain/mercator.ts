/** Web Mercator, in radians of the unit sphere. */
export const RAD = Math.PI / 180;
/** Where Web Mercator stops: the latitude that makes the world square. */
export const MAX_LATITUDE = 85.0511287798;

export const clampLatitude = (lat: number) =>
  Math.max(-MAX_LATITUDE, Math.min(MAX_LATITUDE, lat));
export const mercatorY = (lat: number) =>
  Math.log(Math.tan(Math.PI / 4 + (lat * RAD) / 2));
export const latitudeAt = (y: number) => (2 * Math.atan(Math.exp(y)) - Math.PI / 2) / RAD;
