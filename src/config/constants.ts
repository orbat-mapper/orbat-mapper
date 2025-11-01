import type { ScenarioVersion } from "@/types/scenarioModels";

export const SCENARIO_FILE_VERSION: ScenarioVersion = "2.0.0";
export const LOCALSTORAGE_KEY = "orbat-scenario4";

export const DEFAULT_BASEMAP_ID = "osm";
// custom symbol format: custom1:1003100000:someid
export const CUSTOM_SYMBOL_PREFIX = "custom1:";
export const CUSTOM_SYMBOL_SLICE = 8 + 20 + 1; // length of "custom1:" + length of "1003100000" + 1 colon
