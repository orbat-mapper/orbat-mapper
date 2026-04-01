<script setup lang="ts">
import CloseButton from "@/components/CloseButton.vue";
import { type DetailsPanelMode, useUiStore, useWidthStore } from "@/stores/uiStore";
import PanelResizeHandle from "@/components/PanelResizeHandle.vue";
import { Button } from "@/components/ui/button";
import { PanelRightIcon, PinIcon, PinOffIcon } from "lucide-vue-next";
import OverlayPanelIcon from "@/components/OverlayPanelIcon.vue";

defineProps<{ mode: DetailsPanelMode }>();
const emit = defineEmits(["close"]);
const widthStore = useWidthStore();
const ui = useUiStore();

function setMode(mode: DetailsPanelMode) {
  ui.detailsPanelMode = mode;
}

import { storeToRefs } from "pinia";

const { detailsPanelPinned: isPinned } = storeToRefs(ui);

const sidebarClasses =
  "bg-sidebar border-sidebar-border pointer-events-auto relative flex h-full flex-col overflow-hidden border-l shadow-sm";
const overlayClasses =
  "bg-sidebar border-sidebar-border pointer-events-auto absolute right-2 top-2 z-30 flex max-h-[70vh] flex-col overflow-clip rounded-md border shadow-sm";
</script>

<template>
  <aside
    :class="mode === 'overlay' ? overlayClasses : sidebarClasses"
    :style="{
      width: widthStore.detailsWidth + 'px',
      minWidth: '250px',
      maxWidth: '50vw',
    }"
  >
    <div class="flex items-center gap-0.5 border-b px-1 py-0.5">
      <Button
        :variant="mode === 'overlay' ? 'secondary' : 'ghost'"
        size="icon"
        class="size-7"
        @click="setMode('overlay')"
        title="Overlay"
      >
        <OverlayPanelIcon class="size-3.5" />
      </Button>
      <Button
        :variant="mode === 'sidebar' ? 'secondary' : 'ghost'"
        size="icon"
        class="size-7"
        @click="setMode('sidebar')"
        title="Sidebar"
      >
        <PanelRightIcon class="size-3.5" />
      </Button>
      <div class="bg-border mx-0.5 h-4 w-px" />
      <Button
        :variant="isPinned ? 'secondary' : 'ghost'"
        size="icon"
        class="size-7"
        @click="ui.toggleDetailsPanelPinned()"
        title="Pin panel"
      >
        <PinIcon v-if="isPinned" class="size-3.5" />
        <PinOffIcon v-else class="size-3.5" />
      </Button>
      <CloseButton @click="emit('close')" class="ml-auto bg-transparent" />
    </div>
    <div class="flex-auto overflow-auto p-4">
      <slot />
    </div>
    <PanelResizeHandle
      :width="widthStore.detailsWidth"
      @update="widthStore.detailsWidth = $event"
      @reset="widthStore.resetDetailsWidth()"
      left
    />
  </aside>
</template>
