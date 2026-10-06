export const MS_PER_MINUTE = 60 * 1000;
export const MS_PER_HOUR = 60 * MS_PER_MINUTE;
export const MS_PER_DAY = 24 * MS_PER_HOUR;

/** The time histogram rounds each state to the nearest whole bin, so the bin at `binT`
 * covers [binT - HISTOGRAM_BIN_MS / 2, binT + HISTOGRAM_BIN_MS / 2). */
export const HISTOGRAM_BIN_MS = MS_PER_HOUR;

export function toHistogramBinT(t: number) {
  return Math.round(t / HISTOGRAM_BIN_MS) * HISTOGRAM_BIN_MS;
}

/** The time range a time histogram bin covers. */
export function getHistogramBinRange(binT: number): [number, number] {
  return [binT - HISTOGRAM_BIN_MS / 2, binT + HISTOGRAM_BIN_MS / 2];
}

/** Formats a duration as "N min", "N h" or "N h M min". */
export function formatDuration(milliseconds: number) {
  const totalMinutes = Math.max(0, Math.round(milliseconds / MS_PER_MINUTE));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours <= 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} h`;
  return `${hours} h ${minutes} min`;
}
