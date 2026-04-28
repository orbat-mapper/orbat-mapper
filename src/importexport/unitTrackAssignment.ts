import type { Feature, LineString, MultiLineString, Position } from "geojson";
import type { StateAdd } from "@/types/scenarioModels";
import length from "@turf/length";

type LineFeature = Feature<LineString | MultiLineString>;

export interface TrackAssignmentResult {
  states: StateAdd[];
  skippedPoints: number;
}

export interface TrackAssignmentOptions {
  addStartPosition?: boolean;
  averageSpeed?: number;
}

export function isAssignableTrackFeature(feature: Feature): feature is LineFeature {
  if (feature.geometry?.type === "LineString") {
    return feature.geometry.coordinates.length >= 2;
  }
  if (feature.geometry?.type === "MultiLineString") {
    return feature.geometry.coordinates.some((line) => line.length >= 2);
  }
  return false;
}

export function createUnitTrackStatesFromFeature(
  feature: LineFeature,
  currentTime: number,
  options: TrackAssignmentOptions = {},
): TrackAssignmentResult {
  const coordinates = flattenCoordinates(feature);
  const timedStates = getTimedStates(feature, coordinates);
  if (timedStates.states.length) return timedStates;

  if (!coordinates.length) return { states: [], skippedPoints: 0 };

  const finalCoordinate = coordinates[coordinates.length - 1];
  const startCoordinate = coordinates[0];
  const via = coordinates.length > 2 ? coordinates.slice(1, -1) : undefined;

  let endTime = currentTime;
  if (options.averageSpeed && options.averageSpeed > 0) {
    const distanceMeters = length(feature, { units: "meters" });
    endTime = Math.round(currentTime + (distanceMeters / options.averageSpeed) * 1000);
  }

  return {
    states: [
      ...(options.addStartPosition
        ? [
            {
              t: currentTime,
              location: startCoordinate,
              interpolate: false,
            },
          ]
        : []),
      {
        t: endTime,
        location: finalCoordinate,
        ...(via?.length ? { via } : {}),
        ...(options.addStartPosition ? { viaStartTime: currentTime } : {}),
      },
    ],
    skippedPoints: 0,
  };
}

function getTimedStates(
  feature: LineFeature,
  coordinates: Position[],
): TrackAssignmentResult {
  const times = getCoordinateTimes(feature);
  if (!times) return { states: [], skippedPoints: 0 };

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
