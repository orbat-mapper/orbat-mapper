import type { Feature, LineString } from "geojson";
import type { MapAdapter } from "@orbat-mapper/tactical-draw";
import type { GridAppearance } from "./appearance";
import type { GridReferenceLabel } from "./labels";
import {
  angularResolutionForAdapter,
  buildLatLongGridPortrayal,
  type LatLongPortrayalParts,
} from "./latLong";
import {
  buildLocalGridPortrayal,
  localGridResolutionForAdapter,
  type LocalGridAccuracy,
} from "./local";
import {
  buildMgrsGridPortrayal,
  type ActiveMgrsGridDefinition,
  type MgrsGridPortrayal,
  type MgrsPortrayalLevel,
  type MgrsPortrayalParts,
} from "./mgrs";
import { buildGridFeatures, gridResolutionForAdapter } from "./projected";
import type {
  GridMode,
  LatLongGridDefinition,
  LocalGridDefinition,
  MgrsGridDefinition,
  UtmGridDefinition,
} from "./types";

/** Definitions may be loaded incrementally; the active mode is validated here. */
export interface GridConfiguration {
  mode: GridMode;
  utm?: UtmGridDefinition | null;
  mgrs?: MgrsGridDefinition | null;
  latlong?: LatLongGridDefinition | null;
  local?: LocalGridDefinition | null;
}

export type GridPortrayalStatus =
  | "ok"
  | "definition-unavailable"
  | "portrayal-unavailable"
  | "local-notice"
  | "local-warning"
  | "local-clipped";

export interface GridPortrayalParts {
  mgrs?: MgrsPortrayalParts;
  latlong?: LatLongPortrayalParts;
  localFeatures?: boolean;
  /** `"ups"` lets a retained Web Mercator renderer handle UTM while this module covers the poles. */
  utmFeatures?: boolean | "ups";
}

export interface GridPortrayalRequest {
  configuration: GridConfiguration;
  appearance: GridAppearance;
  mgrsLevel?: MgrsPortrayalLevel | null;
  parts?: GridPortrayalParts;
}

export interface GridPortrayal {
  features: Feature<LineString>[];
  labels: GridReferenceLabel[];
  status: GridPortrayalStatus;
  resolution: number | null;
  localAccuracy: LocalGridAccuracy;
  mgrsLevel: MgrsPortrayalLevel | null;
  activeMgrsDefinition: ActiveMgrsGridDefinition | null;
  hasUtmDetail: boolean;
}

const EMPTY: GridPortrayal = {
  features: [],
  labels: [],
  status: "ok",
  resolution: null,
  localAccuracy: "ok",
  mgrsLevel: null,
  activeMgrsDefinition: null,
  hasUtmDetail: false,
};

function unavailable(status: GridPortrayalStatus): GridPortrayal {
  return { ...EMPTY, status };
}

function mgrsResult(adapter: MapAdapter, portrayal: MgrsGridPortrayal): GridPortrayal {
  return {
    ...EMPTY,
    features: portrayal.features,
    labels: portrayal.labels,
    mgrsLevel: portrayal.level,
    activeMgrsDefinition: portrayal.activeDefinition,
    hasUtmDetail: portrayal.detailDefinitions.some(({ crs }) => crs.kind === "utm"),
    resolution: portrayal.activeDefinition
      ? gridResolutionForAdapter(adapter, portrayal.activeDefinition.crs)
      : null,
  };
}

/**
 * Build any supported grid through one seam. Callers describe only which
 * geometry their renderer already retains; mode selection and metadata stay
 * inside the module.
 */
export function buildGridPortrayal(
  adapter: MapAdapter,
  request: GridPortrayalRequest,
): GridPortrayal {
  const { configuration, appearance, parts } = request;
  switch (configuration.mode) {
    case "mgrs": {
      if (!configuration.mgrs) return unavailable("definition-unavailable");
      const portrayal = buildMgrsGridPortrayal(
        adapter,
        configuration.mgrs,
        appearance,
        request.mgrsLevel,
        parts?.mgrs,
      );
      return portrayal
        ? mgrsResult(adapter, portrayal)
        : unavailable("portrayal-unavailable");
    }
    case "local": {
      if (!configuration.local) return unavailable("definition-unavailable");
      const portrayal = buildLocalGridPortrayal(
        adapter,
        configuration.local,
        appearance,
        parts?.localFeatures,
      );
      if (!portrayal) return unavailable("portrayal-unavailable");
      return {
        ...EMPTY,
        features: portrayal.features,
        status: portrayal.accuracy === "ok" ? "ok" : `local-${portrayal.accuracy}`,
        resolution: localGridResolutionForAdapter(adapter, configuration.local),
        localAccuracy: portrayal.accuracy,
      };
    }
    case "latlong": {
      if (!configuration.latlong) return unavailable("definition-unavailable");
      const portrayal = buildLatLongGridPortrayal(
        adapter,
        configuration.latlong,
        appearance,
        parts?.latlong,
      );
      return portrayal
        ? {
            ...EMPTY,
            features: portrayal.features,
            labels: portrayal.labels,
            resolution: angularResolutionForAdapter(adapter),
          }
        : unavailable("portrayal-unavailable");
    }
    case "utm": {
      if (!configuration.utm) return unavailable("definition-unavailable");
      const includeFeatures =
        parts?.utmFeatures !== false &&
        (parts?.utmFeatures !== "ups" || configuration.utm.crs.kind === "ups");
      const portrayal = includeFeatures
        ? buildGridFeatures(
            adapter,
            configuration.utm.interval,
            configuration.utm.crs,
            appearance,
          )
        : { features: [] };
      return portrayal
        ? {
            ...EMPTY,
            features: portrayal.features,
            resolution: gridResolutionForAdapter(adapter, configuration.utm.crs),
          }
        : unavailable("portrayal-unavailable");
    }
  }
}
