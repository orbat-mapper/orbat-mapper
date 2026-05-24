<script setup lang="ts">
import {
  IconSquareEditOutline as EditIcon,
  IconMapMarkerDistance as ShowPathIcon,
  IconTimelineClockOutline,
} from "@iconify-prerendered/vue-mdi";
import { PlusIcon, RouteIcon } from "@lucide/vue";

import { useMainToolbarStore } from "@/stores/mainToolbarStore";
import MainToolbarButton from "@/components/MainToolbarButton.vue";
import MapEditorSubToolbar from "@/modules/scenarioeditor/MapEditorSubToolbar.vue";
import { useUnitSettingsStore } from "@/stores/geoStore";

const unitSettings = useUnitSettingsStore();
const store = useMainToolbarStore();
</script>
<template>
  <MapEditorSubToolbar label="Track">
    <MainToolbarButton
      title="Show unit track"
      @click="unitSettings.showHistory = !unitSettings.showHistory"
      :active="unitSettings.showHistory"
    >
      <ShowPathIcon class="size-5" />
    </MainToolbarButton>

    <MainToolbarButton
      title="Edit track"
      @click="unitSettings.editHistory = !unitSettings.editHistory"
      :active="unitSettings.editHistory"
    >
      <EditIcon class="size-5" />
    </MainToolbarButton>

    <MainToolbarButton
      title="Show timestamps"
      @click="unitSettings.showWaypointTimestamps = !unitSettings.showWaypointTimestamps"
      :active="unitSettings.showWaypointTimestamps"
    >
      <IconTimelineClockOutline class="size-5" />
    </MainToolbarButton>

    <div class="border-border mx-1 h-5 border-l" />
    <MainToolbarButton
      title="Plan route"
      @click="store.toggleToolbar('route')"
      :active="store.currentToolbar === 'route'"
    >
      <div class="relative">
        <RouteIcon class="size-5" />
        <PlusIcon class="bg-background absolute -right-1.5 -bottom-1 size-3 stroke-[3]" />
      </div>
    </MainToolbarButton>
  </MapEditorSubToolbar>
</template>
