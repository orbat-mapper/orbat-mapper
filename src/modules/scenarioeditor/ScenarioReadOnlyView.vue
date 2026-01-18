<script setup lang="ts">
import { computed, provide, ref, shallowRef } from "vue";
import { type FeatureId } from "@/types/scenarioGeoModels";
import type { TScenario } from "@/scenariostore";
import type { EntityId } from "@/types/base";
import {
  activeFeatureStylesKey,
  activeLayerKey,
  activeParentKey,
  activeScenarioKey,
  currentScenarioTabKey,
  searchActionsKey,
  sidcModalKey,
  timeModalKey,
} from "@/components/injects";
import { useFeatureStyles } from "@/geo/featureStyles";
import type { EventSearchResult } from "@/components/types";
import { useDateModal, useSidcModal } from "@/composables/modals";
import { storeToRefs } from "pinia";
import { useTabStore } from "@/stores/tabStore";
import type { PhotonSearchResult } from "@/composables/geosearching";
import { useSelectedItems } from "@/stores/selectedStore";
import { useMapSettingsStore } from "@/stores/mapSettingsStore";
import { useTimeFormatterProvider } from "@/stores/timeFormatStore";
import PlaybackMenu from "@/modules/scenarioeditor/PlaybackMenu.vue";
import { MoonStarIcon, SunIcon } from "lucide-vue-next";
import { UseDark } from "@vueuse/components";
import { Button } from "@/components/ui/button";
import { createEventHook, useTitle } from "@vueuse/core";
import type { ScenarioActions } from "@/types/constants";
import MapTimeController from "@/components/MapTimeController.vue";
import NewScenarioMap from "@/components/ScenarioMap.vue";
import ScenarioEditorMap from "@/modules/scenarioeditor/ScenarioEditorMap.vue";
import MainMenu from "@/modules/scenarioeditor/MainMenu.vue"; // We might want a simplified menu
import AppNotifications from "@/components/AppNotifications.vue";

const props = defineProps<{ activeScenario: TScenario }>();

const activeParentId = ref<EntityId | undefined | null>(null);
const activeLayerId = ref<FeatureId | undefined | null>(null);
const scnFeatureStyles = useFeatureStyles(props.activeScenario.geo);

const uiTabs = useTabStore();
const { activeScenarioTab } = storeToRefs(uiTabs);
const selectedItems = useSelectedItems();

provide(activeParentKey, activeParentId);
provide(activeLayerKey, activeLayerId);
provide(activeScenarioKey, props.activeScenario);
provide(activeFeatureStylesKey, scnFeatureStyles);
provide(currentScenarioTabKey, activeScenarioTab);

const onUnitSelectHook = createEventHook<{ unitId: EntityId }>();
const onLayerSelectHook = createEventHook<{ layerId: FeatureId }>();
const onImageLayerSelectHook = createEventHook<{ layerId: FeatureId }>();
const onFeatureSelectHook = createEventHook<{
  featureId: FeatureId;
  layerId: FeatureId;
}>();
const onEventSelectHook = createEventHook<EventSearchResult>();
const onPlaceSelectHook = createEventHook<PhotonSearchResult>();
const onScenarioActionHook = createEventHook<{ action: ScenarioActions }>();

provide(searchActionsKey, {
  onUnitSelectHook,
  onLayerSelectHook,
  onFeatureSelectHook,
  onEventSelectHook,
  onPlaceSelectHook,
  onImageLayerSelectHook,
  onScenarioActionHook,
});

const { state } = props.activeScenario.store;

useTimeFormatterProvider({ activeScenario: props.activeScenario });

const mapStore = useMapSettingsStore();
mapStore.baseLayerName = state.mapSettings.baseMapId;

const windowTitle = computed(() => state.info.name);
useTitle(windowTitle);

const { getModalTimestamp } = useDateModal();

provide(timeModalKey, { getModalTimestamp });

// Dummy SIDC modal provider since we don't edit
provide(sidcModalKey, {
  getModalSidc: async () => ({ sidc: "", symbolOptions: {} }),
} as any);

if (state.layers.length > 0) {
  activeLayerId.value = state.layers[0];
}
</script>

<template>
  <div class="bg-background flex h-dvh flex-col overflow-hidden">
    <nav class="flex shrink-0 items-center justify-between py-1 pr-4 pl-6 print:hidden">
      <div class="flex min-w-0 flex-auto items-center">
        <span class="truncate font-medium"
          >{{ activeScenario.store.state.info.name }} (Read Only)</span
        >
      </div>
      <div class="flex shrink-0 items-center space-x-1 overflow-clip sm:space-x-2">
        <PlaybackMenu />
        <UseDark v-slot="{ isDark, toggleDark }">
          <Button
            variant="ghost"
            size="icon"
            @click="toggleDark()"
            title="Toggle dark mode"
            class="text-foreground/70 hidden sm:inline-flex"
          >
            <SunIcon v-if="isDark" class="size-5" /><MoonStarIcon v-else class="size-5" />
          </Button>
        </UseDark>
      </div>
    </nav>
    <ScenarioEditorMap />
    <AppNotifications />
  </div>
</template>
