<script setup lang="ts">
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  IconAddCircleOutline as AddEventIcon,
  IconClockOutline,
  IconZoomInOutline,
  IconZoomOutOutline,
} from "@iconify-prerendered/vue-mdi";
import { useUiStore } from "@/stores/uiStore";

const props = defineProps<{ formattedHoveredDate: string }>();
type TimelineContextAction = "zoomIn" | "zoomOut" | "addScenarioEvent";
const emit = defineEmits<{
  action: [value: TimelineContextAction];
}>();

const uiSettings = useUiStore();

function onContextMenuUpdate(open: boolean) {}

function onContextMenu(e: MouseEvent) {}
</script>

<template>
  <ContextMenu @update:open="onContextMenuUpdate">
    <ContextMenuTrigger as-child>
      <slot :onContextMenu="onContextMenu" />
    </ContextMenuTrigger>
    <ContextMenuContent>
      <ContextMenuLabel class="flex items-center">
        <IconClockOutline class="mr-2 size-5" />
        {{ formattedHoveredDate }}
      </ContextMenuLabel>
      <ContextMenuSeparator />
      <ContextMenuItem @select.prevent="emit('action', 'zoomIn')">
        <IconZoomInOutline class="mr-2 size-5" />
        Zoom In
      </ContextMenuItem>
      <ContextMenuItem @select.prevent="emit('action', 'zoomOut')">
        <IconZoomOutOutline class="mr-2 size-5" />
        Zoom Out
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem @select="emit('action', 'addScenarioEvent')">
        <AddEventIcon class="mr-2 size-5" />
        Add scenario event
      </ContextMenuItem>
      <ContextMenuItem inset @select="uiSettings.showTimeline = false"
        ><span class="ml-1">Hide timeline</span></ContextMenuItem
      >
    </ContextMenuContent>
  </ContextMenu>
</template>
