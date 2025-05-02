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
  <FloatingPanel class="pointer-events-auto flex items-center space-x-1 rounded-md p-1">
    <p class="text-muted-foreground px-2 text-sm font-medium">Track</p>
    <div class="border-border h-5 border-l" />

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

    <MainToolbarButton title="Toggle toolbar" @click="store.clearToolbar()">
      <CloseIcon class="size-5" />
    </MainToolbarButton>
  </FloatingPanel>
</template>
