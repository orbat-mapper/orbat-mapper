<template>
  <aside
    class="pointer-events-auto -mt-12 hidden max-h-[80vh] w-96 overflow-auto rounded-md bg-white shadow md:block"
  >
    <TabGroup
      as="div"
      class="flex h-full flex-auto flex-col"
      :class="{ hidden: !showBottomPanel }"
      :selected-index="activeTabIndex"
      @change="changeTab"
    >
      <TabList class="flex-0 flex justify-between border-b border-gray-500">
        <div class="flex flex-auto items-center justify-evenly">
          <Tab
            as="template"
            v-for="tab in ['ORBAT', 'Events', 'Layers']"
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
        <CloseButton @click="emit('close')" class="px-4" />
      </TabList>
      <TabPanels class="flex-auto overflow-y-auto">
        <TabPanel :unmount="false" class="pb-10">
          <OrbatPanel />
        </TabPanel>
        <TabPanel class="p-4 pb-10">
          <ScenarioEventsPanel @event-click="onEventClick" />
        </TabPanel>
        <TabPanel class="p-4 pb-10"><ScenarioLayersTabPanel /></TabPanel>
      </TabPanels>
    </TabGroup>
  </aside>
</template>
<script setup lang="ts">
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/vue";
import ScenarioEventsPanel from "@/modules/scenarioeditor/ScenarioEventsPanel.vue";
import OrbatPanel from "@/modules/scenarioeditor/OrbatPanel.vue";
import CloseButton from "@/components/CloseButton.vue";
import { useToggle } from "@vueuse/core";
import { useSelectedFeatures, useSelectedUnits } from "@/stores/dragStore";
import { injectStrict } from "@/utils";
import {
  activeMapKey,
  activeScenarioEventKey,
  activeUnitKey,
} from "@/components/injects";
import ScenarioLayersTabPanel from "@/modules/scenarioeditor/ScenarioLayersTabPanel.vue";
import { storeToRefs } from "pinia";
import { useUiStore } from "@/stores/uiStore";
import { onMounted, onUnmounted } from "vue";
import { ScenarioEvent } from "@/types/scenarioModels";

const emit = defineEmits(["close"]);

const activeUnitId = injectStrict(activeUnitKey);
const activeScenarioEventId = injectStrict(activeScenarioEventKey);
const mapRef = injectStrict(activeMapKey);
const { selectedFeatureIds } = useSelectedFeatures();
const { selectedUnitIds } = useSelectedUnits();

const [showBottomPanel, toggleBottomPanel] = useToggle(true);

const { activeTabIndex } = storeToRefs(useUiStore());

function changeTab(index: number) {
  activeTabIndex.value = index;
}

onMounted(() => {
  const padding = mapRef.value.getView().padding || [0, 0, 0, 0];
  const [top, right, bottom, left] = padding;
  mapRef.value.getView().padding = [top, right, bottom, 400];
});

onUnmounted(() => {
  const padding = mapRef.value.getView().padding;
  if (padding) {
    const [top, right, bottom, left] = padding;
    mapRef.value.getView().padding = [top, right, bottom, 0];
  }
});

function onEventClick(scenarioEvent: ScenarioEvent) {
  console.log(scenarioEvent);
  activeScenarioEventId.value = scenarioEvent.id;
}
</script>
