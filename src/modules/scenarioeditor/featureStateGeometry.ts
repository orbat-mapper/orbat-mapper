import type { Geometry } from "geojson";

import { getGeoJSONFeatures } from "@/importexport/geojsonScenarioFeatures";
import type { NGeometryLayerItem } from "@/types/scenarioLayerItems";

export type StateGeometryResult =
  { ok: true; geometry: Geometry } | { ok: false; message: string };

function isGeometry(data: unknown): data is Geometry {
  if (typeof data !== "object" || data === null) return false;
  const { type, coordinates, geometries } = data as Record<string, unknown>;
  return type === "GeometryCollection"
    ? Array.isArray(geometries)
    : typeof type === "string" && Array.isArray(coordinates);
}

type NestedPositions = number | NestedPositions[];

function dropElevation(coordinates: NestedPositions): NestedPositions {
  if (!Array.isArray(coordinates)) return coordinates;
  return typeof coordinates[0] === "number"
    ? coordinates.slice(0, 2)
    : coordinates.map(dropElevation);
}

function to2D(geometry: Geometry): Geometry {
  if (geometry.type === "GeometryCollection") {
    return { ...geometry, geometries: geometry.geometries.map(to2D) };
  }
  return {
    ...geometry,
    coordinates: dropElevation(geometry.coordinates),
  } as Geometry;
}

function findInputGeometry(input: unknown): StateGeometryResult {
  if (isGeometry(input)) return { ok: true, geometry: input };
  const features = getGeoJSONFeatures(input);
  if (features && features.length !== 1) {
    return { ok: false, message: `Expected one feature, got ${features.length}` };
  }
  const geometry = features?.[0].geometry;
  if (!geometry) return { ok: false, message: "No GeoJSON geometry found" };
  return { ok: true, geometry };
}

/**
 * Why `target` cannot take an outside geometry, or `undefined` when it can. Circles
 * and rectangles keep their shape in `geometryMeta`, which plain GeoJSON cannot carry.
 */
export function getStateGeometryBlocker(target: NGeometryLayerItem): string | undefined {
  const meta = target.geometryMeta;
  if (meta.geometryKind === "Circle") return "Circles cannot take a pasted geometry";
  if (meta.geometryKind === "Polygon" && meta.shape === "rectangle") {
    return "Rectangles cannot take a pasted geometry";
  }
}

/**
 * Check that `input` (GeoJSON from the clipboard or another feature) can become a
 * timed geometry of `target`, and return the geometry to record.
 */
export function resolveStateGeometry(
  target: NGeometryLayerItem,
  input: unknown,
): StateGeometryResult {
  const blocker = getStateGeometryBlocker(target);
  if (blocker) return { ok: false, message: blocker };
  const found = findInputGeometry(input);
  if (!found.ok) return found;
  const { geometry } = found;
  const { geometryKind } = target.geometryMeta;
  if (geometry.type !== geometryKind) {
    return {
      ok: false,
      message: `Expected a ${geometryKind} geometry, got ${geometry.type}`,
    };
  }
  return { ok: true, geometry: to2D(geometry) };
}
