import { ref } from "vue";
import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import {
  defaultRegistry,
  type AllMappingData,
} from "@/views/texttoorbat/mappingRegistry";
import type { CommaFieldOrder } from "@/views/texttoorbat/textToOrbat";
import type { Unit } from "@/types/scenarioModels";

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
  const registryVersion = ref(0);

  // Load stored mappings on init
  if (storedMappings.value?.icons?.length || storedMappings.value?.echelons?.length) {
    try {
      defaultRegistry.importMappings(storedMappings.value);
      defaultRegistry.clearUndoRedoStack();
      registryVersion.value = defaultRegistry.version;
    } catch (e) {
      console.warn("Failed to load stored mappings, resetting to defaults", e);
      storedMappings.value = null;
    }
  }

  function handleMappingsChanged() {
    registryVersion.value = defaultRegistry.version;
    storedMappings.value = defaultRegistry.exportMappings();
  }

  function handleMappingsReset() {
    registryVersion.value = defaultRegistry.version;
    storedMappings.value = null;
  }

  return {
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
    registryVersion,
    handleMappingsChanged,
    handleMappingsReset,
  };
});
