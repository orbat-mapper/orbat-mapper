<template>
  <main class="overflow-auto bg-white" :class="[showBottomPanel ? 'h-1/2' : 'h-12']">
    <div v-show="!showBottomPanel" class="flex h-full items-center" ref="swipeUpEl">
      <div
        class="relative flex flex-1 items-center justify-center"
        @click="toggleBottomPanel()"
      >
        <IconButton class="" @click.stop>
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
    <TabGroup
      as="div"
      class="flex h-full flex-col"
      :class="{ hidden: !showBottomPanel }"
      :selected-index="activeTabIndex"
      @change="changeTab"
    >
      <TabList class="flex-0 flex justify-between border-b border-gray-500">
        <div ref="swipeDownEl" class="flex flex-auto items-center justify-evenly">
          <Tab
            as="template"
            v-for="tab in ['ORBAT', 'Events', 'Layers', 'Settings', 'Details']"
            :key="tab"
            v-slot="{ selected }"
          >
            <button
              :class="[
                selected
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                'w-1/2 border-b-2 px-1 py-4 text-center text-sm font-medium',
              ]"
            >
              {{ tab }}
            </button>
          </Tab>
        </div>
        <CloseButton @click="toggleBottomPanel()" class="px-4" />
      </TabList>
      <TabPanels class="flex-auto overflow-y-auto">
        <TabPanel :unmount="false" class="pb-10">
          <OrbatPanel />
        </TabPanel>
        <TabPanel class="p-4 pb-10">
          <ScenarioEventsPanel />
        </TabPanel>
        <TabPanel class="p-4 pb-10"><ScenarioLayersTabPanel /></TabPanel>
        <TabPanel class="p-4 pb-10"><ScenarioSettingsPanel /></TabPanel>
        <TabPanel class="pb-10">
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
        </TabPanel>
      </TabPanels>
    </TabGroup>
  </main>
</template>
<script setup lang="ts">
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/vue";
import { IconChevronDoubleUp } from "@iconify-prerendered/vue-mdi";
import ScenarioEventsPanel from "@/modules/scenarioeditor/ScenarioEventsPanel.vue";
import ScenarioInfoPanel from "@/modules/scenarioeditor/ScenarioInfoPanel.vue";
import ScenarioFeatureDetails from "@/modules/scenarioeditor/ScenarioFeatureDetails.vue";
import OrbatPanel from "@/modules/scenarioeditor/OrbatPanel.vue";
import CloseButton from "@/components/CloseButton.vue";
import IconButton from "@/components/IconButton.vue";
import { ref, watch } from "vue";
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

function changeTab(index: number) {
  activeTabIndex.value = index;
}

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
