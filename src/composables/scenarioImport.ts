import type { TScenario } from "@/scenariostore";
import type { FeatureCollection } from "geojson";
import type { MilXImportPlan } from "@/importexport/milx/convert";

export interface UseScenarioExportOptions {
  activeScenario: TScenario;
}

export function useScenarioImport() {
  async function importMilxString(source: string): Promise<MilXImportPlan> {
    const { parseMilX, convertMilX } = await import("@/importexport/milx");
    return convertMilX(parseMilX(source));
  }

  function importGeojsonString(source: string): FeatureCollection {
    return JSON.parse(source);
  }

  function importJsonString<T>(source: string) {
    return JSON.parse(source) as T;
  }

  return { importMilxString, importGeojsonString, importJsonString };
}
