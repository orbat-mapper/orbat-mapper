import type { Position } from "geojson";
import type { MapAdapter } from "@/geo/contracts/mapAdapter";

export interface ScenarioMapViewSnapshot {
  center: Position;
  zoom: number;
  rotation: number;
}

type ScenarioMapViewSource = Pick<MapAdapter, "getCenter" | "getZoom" | "getRotation">;

export function getScenarioMapViewSnapshot(
  source: ScenarioMapViewSource | null | undefined,
): ScenarioMapViewSnapshot | undefined {
  if (!source) {
    return undefined;
  }

  const center = source?.getCenter();
  const zoom = source?.getZoom();

  if (!center || zoom === undefined) {
    return undefined;
  }

  return {
    center,
    zoom,
    rotation: source.getRotation(),
  };
}

export function radiansToBearingDegrees(rotation: number): number {
  return (rotation * 180) / Math.PI;
}

export function bearingDegreesToRadians(bearing: number): number {
  return (bearing * Math.PI) / 180;
}
