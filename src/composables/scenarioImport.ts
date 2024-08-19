import { injectStrict, nanoid, toDom } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { TScenario } from "@/scenariostore";
import type { FeatureCollection } from "geojson";
import { OrbatMapperGeoJsonFeature } from "@/importexport/jsonish/types";

export interface MilxImportedLayer {
  id: string;
  name?: string;
  features: OrbatMapperGeoJsonFeature[];
}

export interface UseScenarioExportOptions {
  activeScenario: TScenario;
}

export function useScenarioImport(options: Partial<UseScenarioExportOptions> = {}) {
  const { geo } = options.activeScenario || injectStrict(activeScenarioKey);

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
    const json = JSON.parse(source);
    return json;

    //return convertGeojsonLayer(json) as FeatureCollection;
  }

  function importJsonString<T>(source: string) {
    const json = JSON.parse(source) as T;
    return json;
  }

  return { importMilxString, importGeojsonString, importJsonString };
}
