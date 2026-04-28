import type { Feature, LineString, MultiLineString, Position } from "geojson";
import type { StateAdd } from "@/types/scenarioModels";

type LineFeature = Feature<LineString | MultiLineString>;

export interface TrackAssignmentResult {
  states: StateAdd[];
  skippedPoints: number;
}

export function isAssignableTrackFeature(feature: Feature): feature is LineFeature {
  return (
    feature.geometry?.type === "LineString" ||
    feature.geometry?.type === "MultiLineString"
  );
}

export function createUnitTrackStatesFromFeature(
  feature: LineFeature,
  currentTime: number,
): TrackAssignmentResult {
  const timedStates = getTimedStates(feature);
  if (timedStates.states.length) return timedStates;

  const coordinates = flattenCoordinates(feature);
  if (!coordinates.length) return { states: [], skippedPoints: 0 };

  const finalCoordinate = coordinates[coordinates.length - 1];
  const via = coordinates.length > 2 ? coordinates.slice(1, -1) : undefined;
  return {
    states: [
      {
        t: currentTime,
        location: finalCoordinate,
        ...(via?.length ? { via } : {}),
      },
    ],
    skippedPoints: 0,
  };
}

function getTimedStates(feature: LineFeature): TrackAssignmentResult {
  const times = getCoordinateTimes(feature);
  if (!times) return { states: [], skippedPoints: 0 };

  const coordinates = flattenCoordinates(feature);
  const flatTimes = flattenTimes(times);
  const count = Math.min(coordinates.length, flatTimes.length);
  const states: StateAdd[] = [];
  let skippedPoints = Math.abs(coordinates.length - flatTimes.length);

  for (let i = 0; i < count; i++) {
    const time = flatTimes[i];
    const t = typeof time === "string" ? Date.parse(time) : NaN;
    if (!Number.isFinite(t)) {
      skippedPoints++;
      continue;
    }
    states.push({
      t,
      location: coordinates[i],
    });
  }

  return { states, skippedPoints };
}

function getCoordinateTimes(feature: LineFeature): unknown {
  const coordinateProperties = feature.properties?.coordinateProperties;
  if (
    typeof coordinateProperties !== "object" ||
    coordinateProperties === null ||
    Array.isArray(coordinateProperties)
  ) {
    return undefined;
  }
  return (coordinateProperties as Record<string, unknown>).times;
}

function flattenCoordinates(feature: LineFeature): Position[] {
  if (feature.geometry.type === "LineString") {
    return feature.geometry.coordinates;
  }
  return feature.geometry.coordinates.flat();
}

function flattenTimes(times: unknown): unknown[] {
  if (!Array.isArray(times)) return [];
  return times.flat(Infinity);
}
