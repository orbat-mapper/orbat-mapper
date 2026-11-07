import { customRef, markRaw } from "vue";
import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import {
  createTextToOrbat,
  type AllMappingData,
  type CommaFieldOrder,
  type TextToOrbat,
} from "@/lib/textToOrbat";
import type { Unit } from "@/types/scenarioModels";

function createEngine(storedMappings: AllMappingData | null): TextToOrbat {
  if (storedMappings?.icons?.length || storedMappings?.echelons?.length) {
    try {
      return createTextToOrbat({ mappings: storedMappings });
    } catch (e) {
      console.warn("Failed to load stored mappings, resetting to defaults", e);
    }
  }
  return createTextToOrbat();
}

export const useTextToOrbatStore = defineStore("textToOrbat", () => {
  const enableAutocomplete = useLocalStorage("enableAutoComplete", true);
  const matchInputCase = useLocalStorage("textToOrbatMatchCase", true);
  const useCommaSeparator = useLocalStorage("useCommaSeparator", true);
  const commaFieldOrder = useLocalStorage<CommaFieldOrder>(
    "commaFieldOrder",
    "name,shortName,description",
  );
  const standardIdentity = useLocalStorage("textToOrbatSI", "3");
  const defaultStartingEchelon = useLocalStorage("textToOrbatStartEchelon", "18");
  const shortNameMaxLength = useLocalStorage("textToOrbatShortNameMaxLength", 8);
  const shortNameUppercase = useLocalStorage("textToOrbatShortNameUppercase", true);
  const shortNameAllowWhitespace = useLocalStorage(
    "textToOrbatShortNameAllowWhitespace",
    true,
  );
  const shortNameForceLength = useLocalStorage("textToOrbatShortNameForceLength", false);
  const showScratchPad = useLocalStorage("showScratchPad", false);
  const scratchPadUnits = useLocalStorage<Unit[]>("textToOrbatScratchPad", []);
  const storedMappings = useLocalStorage<AllMappingData | null>(
    "textToOrbatMappings_v2",
    null,
    {
      serializer: {
        read: (v: string) => JSON.parse(v),
        write: (v: unknown) => JSON.stringify(v),
      },
    },
  );

  const rawEngine = markRaw(createEngine(storedMappings.value));
  if (storedMappings.value && !rawEngine.mappings.isCustomized)
    storedMappings.value = null;

  rawEngine.mappings.subscribe(() => {
    storedMappings.value = rawEngine.mappings.isCustomized
      ? rawEngine.mappings.exportMappings()
      : null;
  });

  // Reading the engine through this ref makes computeds re-run after its
  // mappings change; the engine object itself never changes
  const engine = customRef<TextToOrbat>((track, trigger) => {
    rawEngine.mappings.subscribe(trigger);
    return {
      get() {
        track();
        return rawEngine;
      },
      set() {},
    };
  });

  return {
    engine,
    enableAutocomplete,
    matchInputCase,
    useCommaSeparator,
    commaFieldOrder,
    standardIdentity,
    defaultStartingEchelon,
    shortNameMaxLength,
    shortNameUppercase,
    shortNameAllowWhitespace,
    shortNameForceLength,
    showScratchPad,
    scratchPadUnits,
  };
});
