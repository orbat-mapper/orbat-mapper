/**
 * Build a world file (".pgw" sidecar) for a Web Mercator (EPSG:3857) raster.
 *
 * A world file is six lines of plain-text affine coefficients that tell GIS
 * tools where a raster sits in the world. Only valid for axis-aligned,
 * north-up exports: the export pipeline enforces `bearing = pitch = 0` when
 * georeferencing is enabled, which keeps the D/B rotation terms at zero.
 */

/** Semi-major axis of WGS 84 — also the Web Mercator sphere radius. */
const EARTH_RADIUS_M = 6378137;

/** Web Mercator clamps latitude to roughly ±85.05113° to keep y finite. */
const MERCATOR_MAX_LAT = 85.05112877980659;

export type LngLat = { lng: number; lat: number };

export type MercatorPoint = { x: number; y: number };

export type MercatorBounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

export type WorldFileParams = {
  /** Pixel size in X (CRS units per pixel). */
  pixelSizeX: number;
  /** Rotation about the Y axis. Zero for axis-aligned rasters. */
  rotationY: number;
  /** Rotation about the X axis. Zero for axis-aligned rasters. */
  rotationX: number;
  /** Pixel size in Y (negative because rows increase downward). */
  pixelSizeY: number;
  /** X coordinate of the centre of the upper-left pixel. */
  upperLeftX: number;
  /** Y coordinate of the centre of the upper-left pixel. */
  upperLeftY: number;
};

/** Project a WGS 84 lng/lat to Web Mercator (EPSG:3857) metres. */
export function lngLatToMercator({ lng, lat }: LngLat): MercatorPoint {
  const clampedLat = Math.max(-MERCATOR_MAX_LAT, Math.min(MERCATOR_MAX_LAT, lat));
  const x = (EARTH_RADIUS_M * lng * Math.PI) / 180;
  const y =
    EARTH_RADIUS_M * Math.log(Math.tan(Math.PI / 4 + (clampedLat * Math.PI) / 360));
  return { x, y };
}

/**
 * Web Mercator bounds derived from a lng/lat envelope. Because the projection
 * is monotonic on both axes, the bbox extents map one-to-one.
 */
export function mercatorBoundsFromLngLat(env: {
  west: number;
  south: number;
  east: number;
  north: number;
}): MercatorBounds {
  const sw = lngLatToMercator({ lng: env.west, lat: env.south });
  const ne = lngLatToMercator({ lng: env.east, lat: env.north });
  return { minX: sw.x, minY: sw.y, maxX: ne.x, maxY: ne.y };
}

/**
 * Build the six world-file parameters for a raster of `widthPx × heightPx`
 * pixels covering the given mercator bounds. The C/F values are offset by half
 * a pixel because the world-file convention anchors them to the *centre* of
 * the upper-left pixel rather than its corner.
 */
export function worldFileFromMercatorBounds(
  bounds: MercatorBounds,
  widthPx: number,
  heightPx: number,
): WorldFileParams {
  if (widthPx < 1 || heightPx < 1) {
    throw new Error("World file requires positive pixel dimensions.");
  }
  const pixelSizeX = (bounds.maxX - bounds.minX) / widthPx;
  const pixelSizeY = -(bounds.maxY - bounds.minY) / heightPx;
  return {
    pixelSizeX,
    rotationY: 0,
    rotationX: 0,
    pixelSizeY,
    upperLeftX: bounds.minX + pixelSizeX / 2,
    upperLeftY: bounds.maxY + pixelSizeY / 2,
  };
}

/**
 * Serialise world-file params as six newline-separated decimal lines, in the
 * canonical A/D/B/E/C/F order. Full float precision keeps round-trips into
 * QGIS/ArcGIS lossless.
 */
export function serializeWorldFile(p: WorldFileParams): string {
  return [
    p.pixelSizeX,
    p.rotationY,
    p.rotationX,
    p.pixelSizeY,
    p.upperLeftX,
    p.upperLeftY,
  ]
    .map((n) => n.toString())
    .join("\n");
}

/**
 * Canonical EPSG:3857 (WGS 84 / Pseudo-Mercator) WKT. Wrapped in a PAM
 * `.aux.xml` sidecar by `serializePamAuxXml` for raster CRS declaration.
 */
export const WEB_MERCATOR_WKT =
  'PROJCS["WGS 84 / Pseudo-Mercator",' +
  'GEOGCS["WGS 84",' +
  'DATUM["WGS_1984",' +
  'SPHEROID["WGS 84",6378137,298.257223563,AUTHORITY["EPSG","7030"]],' +
  'AUTHORITY["EPSG","6326"]],' +
  'PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],' +
  'UNIT["degree",0.0174532925199433,AUTHORITY["EPSG","9122"]],' +
  'AUTHORITY["EPSG","4326"]],' +
  'PROJECTION["Mercator_1SP"],' +
  'PARAMETER["central_meridian",0],' +
  'PARAMETER["scale_factor",1],' +
  'PARAMETER["false_easting",0],' +
  'PARAMETER["false_northing",0],' +
  'UNIT["metre",1,AUTHORITY["EPSG","9001"]],' +
  'AXIS["X",EAST],AXIS["Y",NORTH],' +
  'AUTHORITY["EPSG","3857"]]';

/**
 * Serialise a GDAL PAM (Persistent Auxiliary Metadata) sidecar declaring the
 * raster's CRS — the format GDAL/QGIS read for raster georeferencing, written
 * as `<image>.aux.xml`.
 *
 * The `dataAxisToSRSAxisMapping="1,2"` attribute pins GDAL ≥ 3.0's axis order
 * to (x, y) so the WKT's `AXIS["X",EAST],AXIS["Y",NORTH]` is honoured rather
 * than swapped under traditional CRS conventions.
 */
export function serializePamAuxXml(wkt: string): string {
  return (
    "<PAMDataset>\n" +
    `  <SRS dataAxisToSRSAxisMapping="1,2">${wkt}</SRS>\n` +
    "</PAMDataset>\n"
  );
}
