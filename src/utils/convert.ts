export function convertToMetric(value: number, unit: "m" | "km" | "ft" | "mi" | "nmi") {
  if (unit === "m") return value;
  if (unit === "km") return value * 1000;
  if (unit === "ft") return value * 0.3048;
  if (unit === "mi") return value * 1609.34;
  if (unit === "nmi") return value * 1852;
  return -1;
}
