import { nanoid, toDom } from "@/utils";
import type { TScenario } from "@/scenariostore";
import type { FeatureCollection } from "geojson";
import type { ImportGeoJsonFeature } from "@/importexport/jsonish/types";

export interface MilxImportedLayer {
  id: string;
  name?: string;
  features: ImportGeoJsonFeature[];
}

export interface UseScenarioExportOptions {
  activeScenario: TScenario;
}

export function useScenarioImport() {
  async function importMilxString(source: string): Promise<MilxImportedLayer[]> {
    const { getMilXLayers, convertMilXLayer } = await import("@/importexport/milx");
    const dom = await toDom(source);
    const milxLayers = getMilXLayers(dom);
    return milxLayers
      .map((mlayer) => ({
        id: nanoid(),
        name: mlayer.name || "no name",
        features: convertMilXLayer(mlayer).features,
      }))
      .filter((l) => l.features.length > 0);
  }

  function importGeojsonString(source: string): FeatureCollection {
    return JSON.parse(source);
  }

  function importJsonString<T>(source: string) {
    return JSON.parse(source) as T;
  }

  return { importMilxString, importGeojsonString, importJsonString };
}
