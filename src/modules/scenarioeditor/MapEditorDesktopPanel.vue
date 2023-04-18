<template>
  <TabGroup
    as="div"
    class="flex h-full flex-auto flex-col"
    :class="{ hidden: !showBottomPanel }"
    :selected-index="activeTabIndex"
    @change="changeTab"
  >
    <TabList class="flex-0 flex justify-between border-b border-gray-500">
      <div ref="swipeDownEl" class="flex flex-auto items-center justify-evenly">
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
      <!--<CloseButton @click="toggleBottomPanel()" class="px-4" />-->
    </TabList>
    <TabPanels class="flex-auto overflow-y-auto">
      <TabPanel :unmount="false" class="pb-10">
        <OrbatPanel />
      </TabPanel>
      <TabPanel class="p-4 pb-10">
        <ScenarioEventsPanel />
      </TabPanel>
      <TabPanel class="p-4 pb-10"><p>Not implemented yet</p></TabPanel>
    </TabPanels>
  </TabGroup>
</template>
<script setup lang="ts">
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/vue";
import ScenarioEventsPanel from "@/modules/scenarioeditor/ScenarioEventsPanel.vue";
import OrbatPanel from "@/modules/scenarioeditor/OrbatPanel.vue";
import CloseButton from "@/components/CloseButton.vue";
import { ref } from "vue";
import { useToggle } from "@vueuse/core";
import { useSelectedFeatures, useSelectedUnits } from "@/stores/dragStore";
import { injectStrict } from "@/utils";
import { activeUnitKey } from "@/components/injects";

const activeUnitId = injectStrict(activeUnitKey);
const { selectedFeatureIds } = useSelectedFeatures();
const { selectedUnitIds } = useSelectedUnits();

const [showBottomPanel, toggleBottomPanel] = useToggle(true);

const activeTabIndex = ref(0);

function changeTab(index: number) {
  activeTabIndex.value = index;
}
</script>
