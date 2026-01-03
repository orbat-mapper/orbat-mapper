<script setup lang="ts">
import { TabsContent } from "@/components/ui/tabs";
import { IconChevronDoubleUp } from "@iconify-prerendered/vue-mdi";
import ScenarioEventsPanel from "@/modules/scenarioeditor/ScenarioEventsPanel.vue";
import ScenarioInfoPanel from "@/modules/scenarioeditor/ScenarioInfoPanel.vue";
import ScenarioFeatureDetails from "@/modules/scenarioeditor/ScenarioFeatureDetails.vue";
import OrbatPanel from "@/modules/scenarioeditor/OrbatPanel.vue";
import CloseButton from "@/components/CloseButton.vue";
import IconButton from "@/components/IconButton.vue";
import { computed, defineAsyncComponent, ref, watch } from "vue";
import { useSwipe, useToggle } from "@vueuse/core";
import MapTimeController from "@/components/MapTimeController.vue";
import { useUiStore } from "@/stores/uiStore";
import { storeToRefs } from "pinia";
import ScenarioLayersTabPanel from "@/modules/scenarioeditor/ScenarioLayersTabPanel.vue";
import { useSelectedItems } from "@/stores/selectedStore";
import ScenarioMapLayerDetails from "@/modules/scenarioeditor/ScenarioMapLayerDetails.vue";
import ScenarioEventDetails from "@/modules/scenarioeditor/ScenarioEventDetails.vue";
import UnitDetails from "@/modules/scenarioeditor/UnitDetails.vue";
import ScenarioSettingsPanel from "@/modules/scenarioeditor/ScenarioSettingsPanel.vue";
import MyTabs from "@/components/MyTabs.vue";

const ScenarioFiltersTabPanel = defineAsyncComponent(
  () => import("@/modules/scenarioeditor/ScenarioFiltersTabPanel.vue"),
);

const emit = defineEmits([
  "open-time-modal",
  "inc-day",
  "dec-day",
  "next-event",
  "prev-event",
  "show-settings",
]);

const {
  selectedFeatureIds,
  selectedUnitIds,
  activeUnitId,
  activeScenarioEventId,
  activeMapLayerId,
  activeDetailsPanel,
} = useSelectedItems();
const { mobilePanelOpen: showBottomPanel } = storeToRefs(useUiStore());

const toggleBottomPanel = useToggle(showBottomPanel);

const { activeTabIndex } = storeToRefs(useUiStore());

const activeTabIndexString = computed({
  get: () => activeTabIndex.value.toString(),
  set: (v) => (activeTabIndex.value = parseInt(v)),
});

const swipeUpEl = ref<HTMLElement | null>(null);
const swipeDownEl = ref<HTMLElement | null>(null);

const { isSwiping, direction } = useSwipe(swipeUpEl);
const { isSwiping: isSwipingDown, direction: downDirection } = useSwipe(swipeDownEl);

watch(isSwiping, (swiping) => {
  if (swiping && direction.value === "up") {
    showBottomPanel.value = true;
  }
});

watch(isSwipingDown, (swiping) => {
  if (swiping && downDirection.value === "down") {
    showBottomPanel.value = false;
  }
});
</script>

<template>
  <main class="overflow-auto" :class="[showBottomPanel ? 'h-1/2' : 'h-12']">
    <div v-show="!showBottomPanel" class="flex h-full items-center" ref="swipeUpEl">
      <div
        class="relative flex flex-1 items-center justify-center"
        @click="toggleBottomPanel()"
      >
        <IconButton class="">
          <IconChevronDoubleUp class="h-6 w-6" @click="toggleBottomPanel()" />
        </IconButton>
      </div>

      <MapTimeController
        class="flex-none"
        hide-time
        @open-time-modal="emit('open-time-modal')"
        @show-settings="emit('show-settings')"
        @dec-day="emit('dec-day')"
        @inc-day="emit('inc-day')"
        @next-event="emit('next-event')"
        @prev-event="emit('prev-event')"
      />
    </div>
    <MyTabs
      v-model="activeTabIndexString"
      :items="['ORBAT', 'Events', 'Layers', 'Settings', 'Filter', 'Details']"
      :class="{ hidden: !showBottomPanel }"
    >
      <template #right
        ><CloseButton @click="toggleBottomPanel()" class="px-6"
      /></template>
      <TabsContent value="0" class="mt-0 h-full pb-10">
        <OrbatPanel />
      </TabsContent>
      <TabsContent value="1" class="mt-0 p-4 pb-10">
        <ScenarioEventsPanel />
      </TabsContent>
      <TabsContent value="2" class="mt-0 p-4 pb-10">
        <ScenarioLayersTabPanel />
      </TabsContent>
      <TabsContent value="3" class="mt-0 p-4 pb-10">
        <ScenarioSettingsPanel />
      </TabsContent>
      <TabsContent value="4" class="mt-0">
        <ScenarioFiltersTabPanel />
      </TabsContent>
      <TabsContent value="5" class="mt-0 pb-10">
        <UnitDetails
          v-if="activeDetailsPanel === 'unit'"
          :unit-id="activeUnitId || [...selectedUnitIds][0]"
          class="p-4"
        />
        <ScenarioFeatureDetails
          v-else-if="activeDetailsPanel === 'feature'"
          :selected-ids="selectedFeatureIds"
          class="p-4"
        />
        <ScenarioEventDetails
          v-else-if="activeDetailsPanel === 'event'"
          :event-id="activeScenarioEventId!"
          class="p-4"
        />
        <ScenarioMapLayerDetails
          v-else-if="activeDetailsPanel === 'mapLayer'"
          :layer-id="activeMapLayerId!"
          class="p-4"
        />
        <ScenarioInfoPanel v-else-if="activeDetailsPanel === 'scenario'" class="p-4" />
      </TabsContent>
    </MyTabs>
  </main>
</template>
