<script setup lang="ts">
import { computed } from "vue";
import { Mountain } from "@lucide/vue";
import { ELEVATION_UNAVAILABLE_MESSAGE, useTerrainStore } from "@/stores/terrainStore";

const emit = defineEmits<{ toggle: [enabled: boolean] }>();

const settings = useTerrainStore();
const enabled = computed(() => settings.terrainEnabled && settings.hillshadeEnabled);
const label = computed(() => {
  const action = `${enabled.value ? "Disable" : "Enable"} terrain and hillshade`;
  return settings.elevationUnavailable
    ? `${action}. ${ELEVATION_UNAVAILABLE_MESSAGE}`
    : action;
});

function toggle() {
  const value = !enabled.value;
  settings.terrainEnabled = value;
  settings.hillshadeEnabled = value;
  emit("toggle", value);
}
</script>

<template>
  <button
    type="button"
    class="terrain-map-toggle"
    :aria-pressed="enabled"
    :data-unavailable="settings.elevationUnavailable || undefined"
    :aria-label="label"
    :title="label"
    @click="toggle"
  >
    <Mountain class="terrain-map-toggle-icon" aria-hidden="true" />
  </button>
</template>
