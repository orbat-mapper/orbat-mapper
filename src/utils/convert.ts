import type { SpeedUnitOfMeasure } from "@/types/scenarioModels";

export function convertToMetric(value: number, unit: "m" | "km" | "ft" | "mi" | "nmi") {
  if (unit === "m") return value;
  if (unit === "km") return value * 1000;
  if (unit === "ft") return value * 0.3048;
  if (unit === "mi") return value * 1609.34;
  if (unit === "nmi") return value * 1852;
  return -1;
}

export function convertSpeedToMetric(value: number, unit: SpeedUnitOfMeasure) {
  if (unit === "m/s") return value;
  if (unit === "km/h") return value * 0.277778;
  if (unit === "ft/s") return value * 0.3048;
  if (unit === "mph") return value * 0.44704;
  if (unit === "knots") return value * 0.514444;
  return -1;
}
