import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { StorageSerializers, useLocalStorage } from "@vueuse/core";
import {
  DEFAULT_TERRAIN_DISPLAY,
  TERRAIN_EXAGGERATION_DEFAULT,
  TERRAIN_EXAGGERATION_MIN,
  TERRAIN_EXAGGERATION_MAX,
  type TerrainDisplay,
} from "@/modules/maplibreview/mapTerrain";
import type { HillshadeSettings } from "@/modules/maplibreview/hillshadeSettings";

function clampExaggeration(value: number) {
  return Number.isFinite(value)
    ? Math.min(TERRAIN_EXAGGERATION_MAX, Math.max(TERRAIN_EXAGGERATION_MIN, value))
    : TERRAIN_EXAGGERATION_DEFAULT;
}

export const ELEVATION_UNAVAILABLE_MESSAGE =
  "Elevation data is unavailable. Check your connection or toggle the feature off and on.";

/** Display preferences remembered between visits; never scenario content. */
export const useTerrainStore = defineStore("terrain", () => {
  const terrainEnabled = useLocalStorage(
    "terrainEnabled",
    DEFAULT_TERRAIN_DISPLAY.enabled,
  );
  const hillshadeEnabled = useLocalStorage(
    "hillshadeEnabled",
    DEFAULT_TERRAIN_DISPLAY.hillshadeEnabled,
  );
  const exaggeration = useLocalStorage(
    "terrainExaggeration",
    DEFAULT_TERRAIN_DISPLAY.exaggeration,
  );
  // A stored value may predate the current bounds.
  exaggeration.value = clampExaggeration(exaggeration.value);
  const hillshadeSettings = useLocalStorage<HillshadeSettings>(
    "hillshadeSettings",
    { ...DEFAULT_TERRAIN_DISPLAY.hillshadeSettings },
    { serializer: StorageSerializers.object, mergeDefaults: true },
  );
  const terrainError = ref(false);
  const hillshadeError = ref(false);

  function setExaggeration(value: number) {
    exaggeration.value = clampExaggeration(value);
  }

  function resetHillshade() {
    hillshadeSettings.value = { ...DEFAULT_TERRAIN_DISPLAY.hillshadeSettings };
  }

  const display = computed<TerrainDisplay>(() => ({
    enabled: terrainEnabled.value,
    hillshadeEnabled: hillshadeEnabled.value,
    exaggeration: exaggeration.value,
    hillshadeSettings: hillshadeSettings.value,
  }));

  /** Elevation tiles failed for a feature that is switched on. */
  const elevationUnavailable = computed(
    () =>
      (terrainEnabled.value && terrainError.value) ||
      (hillshadeEnabled.value && hillshadeError.value),
  );

  return {
    terrainEnabled,
    hillshadeEnabled,
    exaggeration,
    hillshadeSettings,
    terrainError,
    hillshadeError,
    elevationUnavailable,
    display,
    setExaggeration,
    resetHillshade,
  };
});
