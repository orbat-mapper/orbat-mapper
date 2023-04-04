import { injectStrict, nanoid } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { TScenario } from "@/scenariostore";
import { useSettingsStore } from "@/stores/settingsStore";
import { toDom } from "@/lib/milx/domutils";
import type { Unzipped } from "fflate";
import type { OrbatMapperGeoJsonFeature } from "@/lib/milx/types";
import type { FeatureCollection } from "geojson";
import { convertGeojsonLayer } from "@/lib/milx";

export interface MilxImportedLayer {
  id: string;
  name?: string;
  features: OrbatMapperGeoJsonFeature[];
}

const settingsStore = useSettingsStore();

export interface UseScenarioExportOptions {
  activeScenario: TScenario;
}

export async function unzip(file: ArrayBuffer) {
  const fflate = await import("fflate");
  return await new Promise<Unzipped>((resolve, reject) => {
    fflate.unzip(new Uint8Array(file), (err, res) => {
      if (err) return reject(err);
      resolve(res);
    });
  });
}

export function useScenarioImport(options: Partial<UseScenarioExportOptions> = {}) {
  const { geo } = options.activeScenario || injectStrict(activeScenarioKey);

  async function importMilxString(source: string): Promise<MilxImportedLayer[]> {
    const { getMilXLayers, convertMilXLayer } = await import("@/lib/milx");
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

    return convertGeojsonLayer(json) as FeatureCollection;
  }

  function importJsonString<T>(source: string) {
    const json = JSON.parse(source) as T;
    return json;
  }

  return { importMilxString, importGeojsonString, importJsonString };
}
