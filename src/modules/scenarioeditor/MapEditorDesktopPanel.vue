<script setup lang="ts">
import { TabsContent } from "@/components/ui/tabs";
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
import MyTabs from "@/components/MyTabs.vue";

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
    <MyTabs
      v-model="activeTabIndexString"
      :items="['ORBAT', 'Events', 'Layers', 'Settings', 'Filters']"
      as="div"
      class="hover-none:mr-3 bg-sidebar"
      :class="{ hidden: !showBottomPanel }"
    >
      <template #right>
        <CloseButton @click="emit('close')" class="bg-transparent" />
      </template>
      <TabsContent value="0" class="h-full pb-10">
        <OrbatPanel />
      </TabsContent>
      <TabsContent value="1" class="p-4 pb-10">
        <ScenarioEventsPanel @event-click="onEventClick" />
      </TabsContent>
      <TabsContent value="2" class="p-4 pb-10"><ScenarioLayersTabPanel /></TabsContent>
      <TabsContent value="3" class="p-4 pb-10"> <ScenarioSettingsPanel /></TabsContent>
      <TabsContent value="4" class=""> <ScenarioFiltersTabPanel /></TabsContent>
    </MyTabs>
    <PanelResizeHandle
      :width="orbatPanelWidth"
      @update="orbatPanelWidth = $event"
      @reset="widthStore.resetOrbatPanelWidth()"
    />
  </aside>
</template>
