<script setup lang="ts">
import {
  IconClose as CloseIcon,
  IconSquareEditOutline as EditIcon,
  IconMapMarkerDistance as ShowPathIcon,
  IconTimelineClockOutline,
} from "@iconify-prerendered/vue-mdi";
import FloatingPanel from "@/components/FloatingPanel.vue";

import { useMainToolbarStore } from "@/stores/mainToolbarStore";
import MainToolbarButton from "@/components/MainToolbarButton.vue";
import { useUnitSettingsStore } from "@/stores/geoStore";

const unitSettings = useUnitSettingsStore();
const store = useMainToolbarStore();
</script>
<template>
  <FloatingPanel
    class="pointer-events-auto flex items-center space-x-1 rounded-md bg-white p-1"
  >
    <p class="px-2 text-sm font-medium text-gray-500">Path</p>
    <div class="h-5 border-l border-gray-300" />

    <MainToolbarButton
      title="Show unit path"
      @click="unitSettings.showHistory = !unitSettings.showHistory"
      :active="unitSettings.showHistory"
    >
      <ShowPathIcon class="h-5 w-5" />
    </MainToolbarButton>

    <MainToolbarButton
      title="Edit path"
      @click="unitSettings.editHistory = !unitSettings.editHistory"
      :active="unitSettings.editHistory"
    >
      <EditIcon class="h-5 w-5" />
    </MainToolbarButton>

    <MainToolbarButton
      title="Show timestamps"
      @click="unitSettings.showWaypointTimestamps = !unitSettings.showWaypointTimestamps"
      :active="unitSettings.showWaypointTimestamps"
    >
      <IconTimelineClockOutline class="h-5 w-5" />
    </MainToolbarButton>

    <MainToolbarButton title="Toggle toolbar" @click="store.clearToolbar()">
      <CloseIcon class="h-5 w-5" />
    </MainToolbarButton>
  </FloatingPanel>
</template>
