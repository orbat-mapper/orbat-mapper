import { defineStore } from "pinia";
import { computed, ref } from "vue";
import {
  DEFAULT_TERRAIN_DISPLAY,
  TERRAIN_EXAGGERATION_DEFAULT,
  TERRAIN_EXAGGERATION_MIN,
  TERRAIN_EXAGGERATION_MAX,
  type TerrainDisplay,
} from "@/modules/maplibreview/mapTerrain";

/** Session display preferences, shared by both Labs layouts; never scenario content. */
export const useTerrainStore = defineStore("terrain", () => {
  const terrainEnabled = ref(DEFAULT_TERRAIN_DISPLAY.enabled);
  const hillshadeEnabled = ref(DEFAULT_TERRAIN_DISPLAY.hillshadeEnabled);
  const exaggeration = ref(DEFAULT_TERRAIN_DISPLAY.exaggeration);
  const hillshadeSettings = ref({ ...DEFAULT_TERRAIN_DISPLAY.hillshadeSettings });
  const terrainError = ref(false);
  const hillshadeError = ref(false);

  function setExaggeration(value: number) {
    exaggeration.value = Number.isFinite(value)
      ? Math.min(TERRAIN_EXAGGERATION_MAX, Math.max(TERRAIN_EXAGGERATION_MIN, value))
      : TERRAIN_EXAGGERATION_DEFAULT;
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

  return {
    terrainEnabled,
    hillshadeEnabled,
    exaggeration,
    hillshadeSettings,
    terrainError,
    hillshadeError,
    display,
    setExaggeration,
    resetHillshade,
  };
});
