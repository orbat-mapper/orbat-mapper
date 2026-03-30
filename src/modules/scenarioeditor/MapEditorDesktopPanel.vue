<script setup lang="ts">
import { TabsContent } from "@/components/ui/tabs";
import ScenarioEventsPanel from "@/modules/scenarioeditor/ScenarioEventsPanel.vue";
import OrbatPanel from "@/modules/scenarioeditor/OrbatPanel.vue";
import CloseButton from "@/components/CloseButton.vue";
import { useToggle } from "@vueuse/core";
import ScenarioLayersTabPanel from "@/modules/scenarioeditor/ScenarioLayersTabPanel.vue";
import { storeToRefs } from "pinia";
import { useUiStore, useWidthStore } from "@/stores/uiStore";
import { computed, defineAsyncComponent } from "vue";
import { type ScenarioEvent } from "@/types/scenarioModels";
import { useSelectedItems } from "@/stores/selectedStore";
import PanelResizeHandle from "@/components/PanelResizeHandle.vue";
import ScenarioSettingsPanel from "@/modules/scenarioeditor/ScenarioSettingsPanel.vue";
import ScrollTabs from "@/components/ScrollTabs.vue";
import OrbatPanelFooterToolbar from "@/modules/scenarioeditor/OrbatPanelFooterToolbar.vue";

const ScenarioFiltersTabPanel = defineAsyncComponent(
  () => import("@/modules/scenarioeditor/ScenarioFiltersTabPanel.vue"),
);

const emit = defineEmits(["close"]);

const { activeScenarioEventId } = useSelectedItems();

const [showBottomPanel, toggleBottomPanel] = useToggle(true);

const { activeTabIndex } = storeToRefs(useUiStore());
const widthStore = useWidthStore();
const { orbatPanelWidth } = storeToRefs(widthStore);

const activeTabIndexString = computed({
  get: () => activeTabIndex.value.toString(),
  set: (v) => (activeTabIndex.value = parseInt(v)),
});

function onEventClick(scenarioEvent: ScenarioEvent) {
  activeScenarioEventId.value = scenarioEvent.id;
}
</script>

<template>
  <aside
    class="bg-sidebar border-sidebar-border relative flex h-full shrink-0 flex-col overflow-hidden border-r shadow-sm"
    :style="{ width: orbatPanelWidth + 'px', minWidth: '250px', maxWidth: '50vw' }"
  >
    <ScrollTabs
      v-model="activeTabIndexString"
      :items="['ORBAT', 'Events', 'Layers', 'Settings', 'Filters']"
      as="div"
      class="hover-none:mr-3 bg-sidebar"
      :class="{ hidden: !showBottomPanel }"
    >
      <template #right>
        <CloseButton @click="emit('close')" class="bg-transparent" />
      </template>
      <TabsContent value="0" class="flex h-full flex-col">
        <div class="min-h-0 flex-1 overflow-y-auto">
          <OrbatPanel />
        </div>
        <OrbatPanelFooterToolbar />
      </TabsContent>
      <TabsContent value="1" class="p-4 pb-10">
        <ScenarioEventsPanel @event-click="onEventClick" />
      </TabsContent>
      <TabsContent value="2" class="p-4 pb-10"><ScenarioLayersTabPanel /></TabsContent>
      <TabsContent value="3" class="p-4 pb-10"> <ScenarioSettingsPanel /></TabsContent>
      <TabsContent value="4" class=""> <ScenarioFiltersTabPanel /></TabsContent>
    </ScrollTabs>
    <PanelResizeHandle
      :width="orbatPanelWidth"
      @update="orbatPanelWidth = $event"
      @reset="widthStore.resetOrbatPanelWidth()"
    />
  </aside>
</template>
