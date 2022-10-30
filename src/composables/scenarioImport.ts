import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { TScenario } from "@/scenariostore";
import { useSettingsStore } from "@/stores/settingsStore";
import { createFromString, toDom } from "@/lib/milx/domutils";
import type { Unzipped } from "fflate";
import type {
  OrbatMapperGeoJsonCollection,
  OrbatMapperGeoJsonFeature,
} from "@/lib/milx/types";

export interface MilxImportedLayer {
  name: string;
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
    const { getMilXLayers, convertMilXLayer } = await import("@/lib/milx/index");
    const dom = await toDom(source);
    const milxLayers = getMilXLayers(dom);
    return milxLayers
      .map((mlayer) => ({
        name: mlayer.name || "no name",
        features: convertMilXLayer(mlayer).features,
      }))
      .filter((l) => l.features.length > 0);
  }

  return { importMilxString };
}
