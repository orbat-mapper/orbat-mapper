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
        @dec-day="emit('dec-day')"
        @inc-day="emit('inc-day')"
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
            v-for="tab in ['ORBAT', 'Details', 'Events', 'Layers']"
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
        <TabPanel class="pb-10">
          <UnitPanel v-if="activeUnitId" :unit-id="activeUnitId" class="p-4" />
          <ScenarioFeatureDetails
            :selected-ids="selectedFeatureIds"
            v-else-if="selectedFeatureIds.size > 0"
            class="p-4"
          />
          <ScenarioInfoPanel v-else />
        </TabPanel>
        <TabPanel class="p-4 pb-10">
          <ScenarioEventsPanel />
        </TabPanel>
        <TabPanel class="p-4 pb-10"><p>Not implemented yet</p></TabPanel>
      </TabPanels>
    </TabGroup>
  </main>
</template>
<script setup lang="ts">
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/vue";
import { IconChevronDoubleUp } from "@iconify-prerendered/vue-mdi";
import ScenarioEventsPanel from "@/modules/scenarioeditor/ScenarioEventsPanel.vue";
import ScenarioInfoPanel from "@/modules/scenarioeditor/ScenarioInfoPanel.vue";
import UnitPanel from "@/modules/scenarioeditor/UnitPanel.vue";
import ScenarioFeatureDetails from "@/modules/scenarioeditor/ScenarioFeatureDetails.vue";
import OrbatPanel from "@/modules/scenarioeditor/OrbatPanel.vue";
import CloseButton from "@/components/CloseButton.vue";
import IconButton from "@/components/IconButton.vue";
import { ref, watch } from "vue";
import { useSwipe, useToggle } from "@vueuse/core";
import { useSelectedFeatures, useSelectedUnits } from "@/stores/dragStore";
import { injectStrict } from "@/utils";
import { activeUnitKey } from "@/components/injects";
import MapTimeController from "@/components/MapTimeController.vue";
import { useUiStore } from "@/stores/uiStore";
import { storeToRefs } from "pinia";

const emit = defineEmits(["open-time-modal", "inc-day", "dec-day"]);

const activeUnitId = injectStrict(activeUnitKey);
const { selectedFeatureIds } = useSelectedFeatures();
const { selectedUnitIds } = useSelectedUnits();
const { mobilePanelOpen: showBottomPanel } = storeToRefs(useUiStore());

const toggleBottomPanel = useToggle(showBottomPanel);

const activeTabIndex = ref(1);

function changeTab(index: number) {
  activeTabIndex.value = index;
}

const swipeUpEl = ref<HTMLElement | null>(null);
const swipeDownEl = ref<HTMLElement | null>(null);

const { isSwiping, direction } = useSwipe(swipeUpEl);
const { isSwiping: isSwipingDown, direction: downDirection } = useSwipe(swipeDownEl);

watch(isSwiping, (swiping) => {
  if (swiping && direction.value === "UP") {
    showBottomPanel.value = true;
  }
});

watch(isSwipingDown, (swiping) => {
  if (swiping && downDirection.value === "DOWN") {
    showBottomPanel.value = false;
  }
});
</script>
