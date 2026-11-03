import { defineStore } from "pinia";
import { type SymbologyStandard } from "@/types/scenarioModels";
import { useLocalStorage } from "@vueuse/core";
import { type ExportSettings, defaultExportSettings } from "@/composables/symbolExport";

/** What the locate button in the unit details toolbar does. */
export type UnitLocateMode = "zoom" | "pan";

export const useSettingsStore = defineStore("settings", {
  state() {
    return {
      orbatIconSize: useLocalStorage("orbatIconSize", 20),
      orbatShortName: useLocalStorage("orbatShortName", false),
      unitLocateMode: useLocalStorage<UnitLocateMode>("unitLocateMode", "zoom"),
    };
  },
});

export const useSymbolExportSettingsStore = defineStore("symbolExportSettings", {
  state() {
    return {
      exportSettings: useLocalStorage<ExportSettings>("symbolExportSettings", {
        ...defaultExportSettings,
      }),
    };
  },
});

export const useSymbolSettingsStore = defineStore("symbolSettings", {
  state() {
    return {
      symbologyStandard: "2525d" as SymbologyStandard,
      simpleStatusModifier: useLocalStorage("simpleStatusModifier", false),
    };
  },
  getters: {
    symbolOptions: (state) => ({
      symbologyStandard: state.symbologyStandard,
      simpleStatusModifier: state.simpleStatusModifier,
    }),
  },
});
