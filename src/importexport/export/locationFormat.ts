import type { Position } from "geojson";
import type { LocationExportFormat } from "@/types/importExport";
import { formatMGRS, formatDecimalDegrees } from "@/utils/geoConvert";
import { toStringHDMS } from "ol/coordinate";

/**
 * Format a location based on the specified export format.
 */
export function formatLocation(
  location: Position | undefined | null,
  format: LocationExportFormat = "json",
): string {
  if (!location) return "";
  const [lon, lat] = location;

  switch (format) {
    case "latlon":
      return `${lat}, ${lon}`;
    case "lonlat":
      return `${lon}, ${lat}`;
    case "mgrs":
      return formatMGRS(location, 5);
    case "dms":
      return toStringHDMS([lon, lat], 0);
    case "dd":
      return formatDecimalDegrees(location, 6);
    case "json":
    default:
      return JSON.stringify(location);
  }
}
