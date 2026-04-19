import type { Position } from "geojson";
import type { RoutingPreview } from "@/geo/routing/types";

export function getRoutingPreviewDisplayDestination(
  preview: RoutingPreview | null,
  fallbackDestination: Position | null,
): Position | null {
  const pathCoordinates = preview?.path.geometry.coordinates;
  if (pathCoordinates && pathCoordinates.length > 0) {
    return pathCoordinates[pathCoordinates.length - 1] ?? fallbackDestination;
  }

  return preview?.end ?? fallbackDestination;
}
