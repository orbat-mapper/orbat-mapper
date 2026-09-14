import { useLocalStorage } from "@vueuse/core";

export interface TrafficReportsImportOptions {
  /** Every `timestamp_utc` is rebased onto this year. */
  targetYear: number;
  /** How long a report stays on the map. 0 keeps it visible for the rest of the scenario. */
  visibilityMinutes: number;
}

export const DEFAULT_TRAFFIC_REPORTS_IMPORT_OPTIONS: TrafficReportsImportOptions = {
  targetYear: 2026,
  visibilityMinutes: 60,
};

/**
 * Module level so the layers panel form and the editor-wide drop target agree on the
 * settings without having to hand them across an import that starts outside Vue.
 */
export const trafficReportsImportOptions = useLocalStorage<TrafficReportsImportOptions>(
  "trafficReportsImportOptions",
  DEFAULT_TRAFFIC_REPORTS_IMPORT_OPTIONS,
  { mergeDefaults: true },
);
