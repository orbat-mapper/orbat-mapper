import type { TScenario } from "@/scenariostore";
import { type Scenario } from "@/types/scenarioModels";
import { strFromU8, strToU8, unzlibSync, zlibSync } from "fflate";

export function useScenarioShare() {
  async function shareScenario(scenario: TScenario) {
    const scenarioData = scenario.io.serializeToObject();
    const jsonString = JSON.stringify(scenarioData);
    const compressed = zlibSync(strToU8(jsonString), { level: 9 });
    const base64 = btoa(strFromU8(compressed, true));
    const url = new URL(window.location.href);
    url.pathname = "/";
    url.hash = "";
    url.searchParams.set("data", base64);
    const urlStr = url.toString();
    const result = { url: urlStr, warning: "" };
    if (urlStr.length > 2048) {
      result.warning = `The generated URL is very long (${urlStr.length} chars). It might not work in some browsers or chat apps.`;
    }
    return result;
  }

  async function loadScenarioFromUrlParam(param: string): Promise<Scenario> {
    const compressed = strToU8(atob(param), true);
    const decompressed = unzlibSync(compressed);
    const jsonString = strFromU8(decompressed);
    return JSON.parse(jsonString) as Scenario;
  }

  return {
    shareScenario,
    loadScenarioFromUrlParam,
  };
}
