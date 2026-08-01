import type { MaybeRef } from "vue";

export type MeasurementTypes = "LineString" | "Polygon";
export type MeasurementUnit = "metric" | "imperial" | "nautical";

export interface MeasurementInteractionOptions {
  showSegments?: MaybeRef<boolean>;
  clearPrevious?: MaybeRef<boolean>;
  enable?: MaybeRef<boolean>;
  measurementUnit?: MaybeRef<MeasurementUnit>;
  snap?: MaybeRef<boolean>;
  showCircle?: MaybeRef<boolean>;
  showGeodesicPaths?: MaybeRef<boolean>;
}
