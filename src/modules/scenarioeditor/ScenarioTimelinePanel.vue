<script setup lang="ts">
import { storeToRefs } from "pinia";
import { ChevronDownIcon, ChevronUpIcon } from "@lucide/vue";
import PanelHeightResizeHandle from "@/components/PanelHeightResizeHandle.vue";
import { Button } from "@/components/ui/button";
import ScenarioTimeline from "@/modules/scenarioeditor/ScenarioTimeline.vue";
import { useUiStore, useWidthStore } from "@/stores/uiStore";

const ui = useUiStore();
const widthStore = useWidthStore();
const { timelineHeight } = storeToRefs(widthStore);
const { timelineCollapsed } = storeToRefs(ui);

const COLLAPSED_HEIGHT = 32;
const MIN_TIMELINE_HEIGHT = 72;
const MAX_TIMELINE_HEIGHT = 320;

function collapseTimeline() {
  ui.timelineCollapsed = true;
}

function expandTimeline() {
  ui.timelineCollapsed = false;
}
</script>

<template>
  <aside
    class="bg-sidebar border-border relative shrink-0 overflow-hidden border-t shadow-sm"
    :style="{
      height: `${timelineCollapsed ? COLLAPSED_HEIGHT : timelineHeight}px`,
      minHeight: `${timelineCollapsed ? COLLAPSED_HEIGHT : MIN_TIMELINE_HEIGHT}px`,
      maxHeight: `${MAX_TIMELINE_HEIGHT}px`,
    }"
  >
    <PanelHeightResizeHandle
      v-if="!timelineCollapsed"
      :height="timelineHeight"
      :min="MIN_TIMELINE_HEIGHT"
      :max="MAX_TIMELINE_HEIGHT"
      @update="timelineHeight = $event"
      @reset="widthStore.resetTimelineHeight()"
    />

    <div
      v-if="timelineCollapsed"
      class="flex h-full items-center justify-between gap-2 px-2"
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        class="size-7 shrink-0"
        title="Expand timeline"
        aria-label="Expand timeline"
        @click="expandTimeline"
      >
        <ChevronUpIcon class="size-4" />
      </Button>
      <span class="text-muted-foreground flex-1 text-xs font-medium">Timeline</span>
    </div>

    <div v-else class="relative flex h-full min-h-0 flex-col">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        class="absolute top-0.5 left-1 z-20 size-7"
        title="Collapse timeline"
        aria-label="Collapse timeline"
        @click="collapseTimeline"
      >
        <ChevronDownIcon class="size-4" />
      </Button>
      <ScenarioTimeline class="min-h-0 flex-1" />
    </div>
  </aside>
</template>
