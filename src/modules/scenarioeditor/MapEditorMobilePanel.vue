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
import { useSwipe, useThrottleFn, useToggle, useWindowSize } from "@vueuse/core";
import MapTimeController from "@/components/MapTimeController.vue";
import { useUiStore } from "@/stores/uiStore";
import { storeToRefs } from "pinia";
import ScenarioLayersTabPanel from "@/modules/scenarioeditor/ScenarioLayersTabPanel.vue";
import { useSelectedItems } from "@/stores/selectedStore";
import ScenarioMapLayerDetails from "@/modules/scenarioeditor/ScenarioMapLayerDetails.vue";
import ScenarioEventDetails from "@/modules/scenarioeditor/ScenarioEventDetails.vue";
import UnitDetails from "@/modules/scenarioeditor/UnitDetails.vue";
import ScenarioSettingsPanel from "@/modules/scenarioeditor/ScenarioSettingsPanel.vue";
import ScrollTabs from "@/components/ScrollTabs.vue";
import { GripHorizontal } from "lucide-vue-next";

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
const uiStore = useUiStore();
const {
  mobilePanelOpen: showBottomPanel,
  mobilePanelHeight,
  activeTabIndex,
} = storeToRefs(uiStore);

const toggleBottomPanel = useToggle(showBottomPanel);
const { height: windowHeight } = useWindowSize();

const activeTabIndexString = computed({
  get: () => activeTabIndex.value.toString(),
  set: (v) => (activeTabIndex.value = parseInt(v)),
});

const swipeControlsEl = ref<HTMLElement | null>(null);
const { isSwiping, direction } = useSwipe(swipeControlsEl);

watch(isSwiping, (swiping) => {
  if (swiping && direction.value === "up" && !showBottomPanel.value) {
    showBottomPanel.value = true;
  }
  if (
    swiping &&
    direction.value === "down" &&
    showBottomPanel.value &&
    !isResizing.value
  ) {
    showBottomPanel.value = false;
  }
});

const MIN_PANEL_HEIGHT = 120;
const MAX_PANEL_HEIGHT_PADDING = 120;

const maxPanelHeight = computed(() =>
  Math.max(MIN_PANEL_HEIGHT, windowHeight.value - MAX_PANEL_HEIGHT_PADDING),
);

const clampPanelHeight = (value: number) =>
  Math.round(Math.min(maxPanelHeight.value, Math.max(MIN_PANEL_HEIGHT, value)));

watch(
  maxPanelHeight,
  () => {
    mobilePanelHeight.value = clampPanelHeight(mobilePanelHeight.value);
  },
  { immediate: true },
);

const panelStyle = computed(() =>
  showBottomPanel.value
    ? {
        height: `${clampPanelHeight(mobilePanelHeight.value)}px`,
      }
    : undefined,
);

const resizeHandleRef = ref<HTMLElement | null>(null);
const isResizing = ref(false);
let didDragResize = false;
let ignoreNextHandleClick = false;
let startY = 0;
let startHeight = 0;
const DRAG_THRESHOLD = 8;

function onResizePointerDown(event: PointerEvent) {
  if (!showBottomPanel.value) return;
  startY = event.clientY;
  startHeight = clampPanelHeight(mobilePanelHeight.value);
  didDragResize = false;
  resizeHandleRef.value?.setPointerCapture(event.pointerId);
  isResizing.value = true;
}

function onResizePointerUp(event: PointerEvent) {
  if (!showBottomPanel.value || !isResizing.value) return;
  if (resizeHandleRef.value?.hasPointerCapture(event.pointerId)) {
    resizeHandleRef.value.releasePointerCapture(event.pointerId);
  }
  if (!didDragResize) {
    showBottomPanel.value = false;
    ignoreNextHandleClick = true;
  }
  isResizing.value = false;
  didDragResize = false;
}

function onResizePointerMove(event: PointerEvent) {
  if (!showBottomPanel.value || !isResizing.value) return;
  const deltaY = startY - event.clientY;
  if (!didDragResize && Math.abs(deltaY) < DRAG_THRESHOLD) {
    return;
  }
  didDragResize = true;
  mobilePanelHeight.value = clampPanelHeight(startHeight + deltaY);
}

const throttledResizePointerMove = useThrottleFn(onResizePointerMove, 16);

function onHandleClick() {
  if (ignoreNextHandleClick) {
    ignoreNextHandleClick = false;
    return;
  }
  toggleBottomPanel();
}
</script>

<template>
  <main
    class="bg-background overflow-hidden"
    :class="[showBottomPanel ? '' : 'h-12']"
    :style="panelStyle"
  >
    <div id="mob-controls" class="flex h-12 items-center" ref="swipeControlsEl">
      <div
        ref="resizeHandleRef"
        role="separator"
        aria-orientation="horizontal"
        :aria-label="showBottomPanel ? 'Resize or collapse panel' : 'Expand panel'"
        class="active:bg-muted/40 relative flex flex-1 touch-none items-center justify-center"
        :class="showBottomPanel ? 'cursor-row-resize' : 'cursor-pointer'"
        @click="onHandleClick"
        @pointerdown="onResizePointerDown"
        @pointerup="onResizePointerUp"
        @pointercancel="onResizePointerUp"
        @pointermove="throttledResizePointerMove"
      >
        <IconButton class="">
          <GripHorizontal v-if="showBottomPanel" class="size-6" />
          <IconChevronDoubleUp v-else class="size-6" />
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
    <ScrollTabs
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
    </ScrollTabs>
  </main>
</template>
