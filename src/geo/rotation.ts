export const ROTATION_EPSILON = 1e-6;

export function normalizeRotation(rotation: number): number {
  const normalized = rotation % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

export function toHeadingFromNorthDegrees(
  center: readonly [number, number] | number[],
  point: readonly [number, number] | number[],
): number {
  const dx = point[0] - center[0];
  const dy = point[1] - center[1];
  const angleFromEast = (Math.atan2(dy, dx) * 180) / Math.PI;
  return normalizeRotation(90 - angleFromEast);
}

export function shortestRotationDelta(nextAngle: number, prevAngle: number): number {
  let delta = normalizeRotation(nextAngle - prevAngle);
  if (delta > 180) delta -= 360;
  return delta;
}
