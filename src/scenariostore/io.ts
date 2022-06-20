import { until, useFetch, useLocalStorage } from "@vueuse/core";
import { useScenarioStore } from "@/stores/scenarioStore";
import { Scenario } from "@/types/scenarioModels";
import * as FileSaver from "file-saver";
import { NewScenarioStore, useNewScenarioStore } from "./newScenarioStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { ShallowRef } from "vue";
import { isLoading } from "@/scenariostore/index";

export function useScenarioIO(store: ShallowRef<NewScenarioStore>) {
  function saveToLocalStorage(key = "orbat-scenario2") {
    const scn = useLocalStorage(key, "");
    const scenario = useScenarioStore();
    scn.value = scenario.stringify();
  }

  function loadFromLocalStorage(key = "orbat-scenario2") {
    const scenario = useScenarioStore();
    const scn = useLocalStorage(key, "");

    if (scn.value) {
      scenario.$reset();
      scenario.loadScenario(JSON.parse(scn.value));
    }
  }

  function loadFromObject(data: Scenario) {
    store.value = useNewScenarioStore(data);
  }

  async function loadFromUrl(url: string) {
    const { data, isFinished, statusCode, error } = useFetch<Scenario>(url).json();
    await until(isFinished).toBe(true);

    if (error.value) {
      console.error(statusCode.value, error.value);
      return;
    }
    loadFromObject(data.value);
  }

  function loadEmptyScenario() {
    const settingsStore = useSettingsStore();
    let timeZone;
    try {
      timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (e) {}
    const scn: Scenario = {
      name: "New scenario",
      type: "ORBAT-mapper",
      symbologyStandard: settingsStore.symbologyStandard,
      version: "0.5.0",
      description: "Empty scenario description",
      sides: [],
      events: [],
      layers: [],
      startTime: new Date().getTime(),
      timeZone,
    };
    loadFromObject(scn);
  }

  async function loadDemoScenario(id: string) {
    isLoading.value = true;
    const idUrlMap: Record<string, string> = {
      falkland82: "/scenarios/falkland82.json",
      narvik40: "/scenarios/narvik40.json",
    };
    const url = idUrlMap[id];
    if (!url) {
      console.warn("Unknown scenario id", id);
      return;
    }
    await loadFromUrl(url);
    isLoading.value = false;
  }

  async function downloadAsJson(fileName = "scenario.json") {
    const scenario = useScenarioStore();
    FileSaver.saveAs(
      new Blob([scenario.stringify()], {
        type: "application/json",
      }),
      fileName
    );
  }
  return { loadDemoScenario, loadEmptyScenario };
}
