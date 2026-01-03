<script setup lang="ts">
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import ScenarioEventsPanel from "@/modules/scenarioeditor/ScenarioEventsPanel.vue";
import OrbatPanel from "@/modules/scenarioeditor/OrbatPanel.vue";
import CloseButton from "@/components/CloseButton.vue";
import { useToggle } from "@vueuse/core";
import { injectStrict } from "@/utils";
import { activeMapKey } from "@/components/injects";
import ScenarioLayersTabPanel from "@/modules/scenarioeditor/ScenarioLayersTabPanel.vue";
import { storeToRefs } from "pinia";
import { useUiStore, useWidthStore } from "@/stores/uiStore";
import { computed, defineAsyncComponent, onMounted, onUnmounted } from "vue";
import { type ScenarioEvent } from "@/types/scenarioModels";
import { useSelectedItems } from "@/stores/selectedStore";
import PanelResizeHandle from "@/components/PanelResizeHandle.vue";
import ScenarioSettingsPanel from "@/modules/scenarioeditor/ScenarioSettingsPanel.vue";

const ScenarioFiltersTabPanel = defineAsyncComponent(
  () => import("@/modules/scenarioeditor/ScenarioFiltersTabPanel.vue"),
);

const emit = defineEmits(["close"]);

const mapRef = injectStrict(activeMapKey);
const { activeScenarioEventId } = useSelectedItems();

const [showBottomPanel, toggleBottomPanel] = useToggle(true);

const { activeTabIndex } = storeToRefs(useUiStore());
const widthStore = useWidthStore();
const { orbatPanelWidth } = storeToRefs(widthStore);

const activeTabIndexString = computed({
  get: () => activeTabIndex.value.toString(),
  set: (v) => (activeTabIndex.value = parseInt(v)),
});

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
  activeScenarioEventId.value = scenarioEvent.id;
}
</script>

<template>
  <aside
    class="pointer-events-auto relative -mt-12 hidden max-h-[80vh] overflow-auto rounded-md border-t border-b border-l border-gray-300 shadow-sm md:block dark:border-slate-700"
    :style="{ width: orbatPanelWidth + 'px' }"
  >
    <Tabs
      v-model="activeTabIndexString"
      as="div"
      class="hover-none:mr-3 bg-sidebar text-sidebar-foreground mr-1.5 flex h-full flex-auto flex-col"
      :class="{ hidden: !showBottomPanel }"
    >
      <TabsList
        class="flex h-11 w-full items-center justify-between rounded-none border-b border-gray-500 bg-transparent p-0"
      >
        <div class="flex flex-auto items-center justify-evenly">
          <TabsTrigger
            v-for="(tab, index) in ['ORBAT', 'Events', 'Layers', 'Settings', 'Filters']"
            :key="tab"
            :value="index.toString()"
            class="data-[state=active]:border-b-primary data-[state=active]:text-primary text-muted-foreground w-1/2 rounded-none border-b-2 border-transparent bg-transparent px-1 py-3 text-center text-sm font-medium shadow-none transition-none hover:border-gray-300 hover:text-gray-700 focus-visible:ring-0 data-[state=active]:bg-transparent data-[state=active]:shadow-none dark:text-gray-400"
          >
            {{ tab }}
          </TabsTrigger>
        </div>
        <CloseButton @click="emit('close')" class="mt-1 mr-1" />
      </TabsList>
      <div class="flex-auto overflow-y-auto">
        <TabsContent value="0" class="mt-0 h-full pb-10">
          <OrbatPanel />
        </TabsContent>
        <TabsContent value="1" class="mt-0 p-4 pb-10">
          <ScenarioEventsPanel @event-click="onEventClick" />
        </TabsContent>
        <TabsContent value="2" class="mt-0 p-4 pb-10"
          ><ScenarioLayersTabPanel
        /></TabsContent>
        <TabsContent value="3" class="mt-0 p-4 pb-10">
          <ScenarioSettingsPanel
        /></TabsContent>
        <TabsContent value="4" class="mt-0"> <ScenarioFiltersTabPanel /></TabsContent>
      </div>
    </Tabs>
    <PanelResizeHandle
      :width="orbatPanelWidth"
      @update="orbatPanelWidth = $event"
      @reset="widthStore.resetOrbatPanelWidth()"
    />
  </aside>
</template>
