/** Latitude beyond which Web Mercator diverges; the projection's usable limit. */
export const WEB_MERCATOR_MAX_LATITUDE = 85.05112878;

export function clampMercatorLatitude(latitude: number): number {
  return Math.max(
    -WEB_MERCATOR_MAX_LATITUDE,
    Math.min(WEB_MERCATOR_MAX_LATITUDE, latitude),
  );
}

export function latitudeToMercatorY(latitude: number): number {
  const radians = (clampMercatorLatitude(latitude) * Math.PI) / 180;
  return Math.log(Math.tan(Math.PI / 4 + radians / 2));
}

export function mercatorYToLatitude(y: number): number {
  return (Math.atan(Math.exp(y)) * 2 - Math.PI / 2) * (180 / Math.PI);
}

export function wrapLongitude(longitude: number): number {
  let wrapped = ((((longitude + 180) % 360) + 360) % 360) - 180;
  if (wrapped === -180 && longitude > 0) wrapped = 180;
  return wrapped;
}

export function unwrapLongitude(referenceLongitude: number, longitude: number): number {
  const wrapped = wrapLongitude(longitude);
  return wrapped + Math.round((referenceLongitude - wrapped) / 360) * 360;
}
