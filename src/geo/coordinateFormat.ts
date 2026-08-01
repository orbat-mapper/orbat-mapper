export type CoordinateFormat = (coordinate: number[] | undefined) => string;

export type CoordinateFormatType =
  "MGRS" | "DecimalDegrees" | "DegreeMinuteSeconds" | "dms" | "dd";

function modulo(a: number, b: number) {
  const r = a % b;
  return r * b < 0 ? r + b : r;
}

function toFixed(n: number, decimals: number) {
  const factor = Math.pow(10, decimals);
  return Math.round(n * factor) / factor;
}

function padNumber(number: number, width: number, precision?: number) {
  const numberString = precision !== undefined ? number.toFixed(precision) : "" + number;
  let decimal = numberString.indexOf(".");
  decimal = decimal === -1 ? numberString.length : decimal;
  return decimal > width
    ? numberString
    : new Array(1 + width - decimal).join("0") + numberString;
}

export function degreesToStringHDMS(
  hemispheres: string,
  degrees: number,
  fractionDigits?: number,
) {
  const normalizedDegrees = modulo(degrees + 180, 360) - 180;
  const x = Math.abs(3600 * normalizedDegrees);
  const decimals = fractionDigits || 0;

  let deg = Math.floor(x / 3600);
  let min = Math.floor((x - deg * 3600) / 60);
  let sec = toFixed(x - deg * 3600 - min * 60, decimals);

  if (sec >= 60) {
    sec = 0;
    min += 1;
  }

  if (min >= 60) {
    min = 0;
    deg += 1;
  }

  let hdms = deg + "°";
  if (min !== 0 || sec !== 0) {
    hdms += " " + padNumber(min, 2) + "′";
  }
  if (sec !== 0) {
    hdms += " " + padNumber(sec, 2, decimals) + "″";
  }
  if (normalizedDegrees !== 0) {
    hdms += " " + hemispheres.charAt(normalizedDegrees < 0 ? 1 : 0);
  }

  return hdms;
}

/**
 * Format a geographic coordinate with the hemisphere, degrees, minutes, and
 * seconds.
 */
export function toStringHDMS(coordinate?: number[], fractionDigits?: number): string {
  if (coordinate) {
    return (
      degreesToStringHDMS("NS", coordinate[1], fractionDigits) +
      " " +
      degreesToStringHDMS("EW", coordinate[0], fractionDigits)
    );
  }
  return "";
}
