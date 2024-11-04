<script setup lang="ts">
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { toLonLat } from "ol/proj";
import { LayerType } from "@/modules/scenarioeditor/featureLayerUtils";
import {
  IconClockOutline,
  IconSpeedometer,
  IconZoomInOutline,
  IconZoomOutOutline,
} from "@iconify-prerendered/vue-mdi";

const props = defineProps<{ formattedHoveredDate: string }>();
const emit = defineEmits<{
  action: [value: string];
}>();

function onContextMenuUpdate(open: boolean) {}

function onContextMenu(e: MouseEvent) {
  console.log("onContextMenu", e);
}
</script>

<template>
  <ContextMenu @update:open="onContextMenuUpdate">
    <ContextMenuTrigger as-child>
      <slot :onContextMenu="onContextMenu" />
    </ContextMenuTrigger>
    <ContextMenuContent>
      <ContextMenuLabel class="flex items-center">
        <IconClockOutline class="mr-1 h-4 w-4" />
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
    </ContextMenuContent>
  </ContextMenu>
</template>
