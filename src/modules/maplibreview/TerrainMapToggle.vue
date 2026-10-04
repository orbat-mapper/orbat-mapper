<script setup lang="ts">
import { computed } from "vue";
import { Mountain } from "@lucide/vue";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useElevationArchive } from "@/composables/elevationArchive";
import { useTerrainStore } from "@/stores/terrainStore";

const emit = defineEmits<{ toggle: [enabled: boolean] }>();

const settings = useTerrainStore();
const {
  pendingElevationArchive,
  activatePendingElevationArchive,
  openElevationArchivePicker,
  chooseOnlineElevation,
} = useElevationArchive();
const enabled = computed(() => settings.terrainEnabled && settings.hillshadeEnabled);
// With no elevation source the button cannot show anything. It offers to open an archive instead
// of switching on a feature that would only turn amber.
const needsArchive = computed(() => !settings.elevationSource);
// A build that leaves online data off lets the user choose between it and an archive.
const offersChoice = computed(
  () => needsArchive.value && settings.onlineElevationOptional,
);
const label = computed(() => {
  if (offersChoice.value) return "Choose elevation data to show terrain";
  if (needsArchive.value) {
    const pending = pendingElevationArchive.value;
    if (pending && pending.action !== "pick") {
      return `${pending.verb} ${pending.label} to show terrain`;
    }
    return "Open an elevation archive to show terrain";
  }
  const action = `${enabled.value ? "Disable" : "Enable"} terrain and hillshade`;
  return settings.elevationUnavailable
    ? `${action}. ${settings.elevationUnavailableMessage}`
    : action;
});

function showTerrain() {
  settings.terrainEnabled = true;
  settings.hillshadeEnabled = true;
  emit("toggle", true);
}

async function provide(open: () => Promise<boolean>) {
  if (await open()) showTerrain();
}

async function useOnline() {
  await chooseOnlineElevation();
  showTerrain();
}

async function toggle() {
  if (needsArchive.value) return provide(activatePendingElevationArchive);
  const value = !enabled.value;
  settings.terrainEnabled = value;
  settings.hillshadeEnabled = value;
  emit("toggle", value);
}
</script>

<template>
  <DropdownMenu v-if="offersChoice">
    <DropdownMenuTrigger as-child>
      <button type="button" class="terrain-map-toggle" :aria-label="label" :title="label">
        <Mountain class="terrain-map-toggle-icon" aria-hidden="true" />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent side="left" align="start" class="max-w-64">
      <DropdownMenuItem
        v-if="pendingElevationArchive"
        @select="provide(activatePendingElevationArchive)"
      >
        <span class="truncate">{{ pendingElevationArchive.menuText }}</span>
      </DropdownMenuItem>
      <DropdownMenuItem @select="useOnline()">Use Mapterhorn online</DropdownMenuItem>
      <DropdownMenuItem @select="provide(openElevationArchivePicker)">
        Open elevation archive…
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
  <button
    v-else
    type="button"
    class="terrain-map-toggle"
    :aria-pressed="needsArchive ? undefined : enabled"
    :data-unavailable="settings.elevationUnavailable || undefined"
    :aria-label="label"
    :title="label"
    @click="toggle"
  >
    <Mountain class="terrain-map-toggle-icon" aria-hidden="true" />
  </button>
</template>
