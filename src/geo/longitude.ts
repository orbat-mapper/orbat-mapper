import type { Position } from "geojson";

export function wrapLongitude(longitude: number) {
  let wrapped = ((((longitude + 180) % 360) + 360) % 360) - 180;
  if (wrapped === -180 && longitude > 0) {
    wrapped = 180;
  }
  return wrapped;
}

export function unwrapLongitude(referenceLongitude: number, longitude: number) {
  const wrapped = wrapLongitude(longitude);
  return wrapped + Math.round((referenceLongitude - wrapped) / 360) * 360;
}

export function unwrapPositionRelative(
  reference: Position,
  position: Position,
): Position {
  return [unwrapLongitude(reference[0], position[0]), position[1]];
}

export function unwindCoordinates(coordinates: Position[]): Position[] {
  if (coordinates.length <= 1) {
    return coordinates.map(([longitude, latitude]) => [longitude, latitude]);
  }

  const result: Position[] = [[coordinates[0]![0], coordinates[0]![1]]];

  for (let index = 1; index < coordinates.length; index += 1) {
    const [longitude, latitude] = coordinates[index]!;
    result.push([unwrapLongitude(result[index - 1]![0], longitude), latitude]);
  }

  return result;
}
