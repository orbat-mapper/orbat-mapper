<script setup lang="ts">
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useBaseLayersStore } from "@/stores/baseLayersStore";
import { computed, ref } from "vue";
import {
  GLOBE_VECTOR_BASEMAP_ID,
  getSupportedGlobeBasemaps,
} from "@/modules/globeview/globeBasemaps";

const baseLayersStore = useBaseLayersStore();
const triggerElement = ref<HTMLElement | null>(null);
let replayingContextMenu = false;
const baseMapId = defineModel<string>("baseMapId", {
  default: GLOBE_VECTOR_BASEMAP_ID,
});

const basemapOptions = computed(() => getSupportedGlobeBasemaps(baseLayersStore.layers));

function onContextMenuCapture(event: MouseEvent) {
  if (replayingContextMenu) return;

  event.preventDefault();
  event.stopPropagation();

  if (!triggerElement.value) return;

  replayingContextMenu = true;
  triggerElement.value.dispatchEvent(
    new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
      composed: true,
      button: 2,
      buttons: event.buttons,
      clientX: event.clientX,
      clientY: event.clientY,
      ctrlKey: event.ctrlKey,
      altKey: event.altKey,
      shiftKey: event.shiftKey,
      metaKey: event.metaKey,
      screenX: event.screenX,
      screenY: event.screenY,
    }),
  );
  replayingContextMenu = false;
}
</script>

<template>
  <ContextMenu>
    <ContextMenuTrigger as-child>
      <div
        ref="triggerElement"
        class="h-full w-full"
        @contextmenu.capture="onContextMenuCapture"
      >
        <slot />
      </div>
    </ContextMenuTrigger>
    <ContextMenuContent>
      <ContextMenuSub>
        <ContextMenuSubTrigger inset>Map base layer</ContextMenuSubTrigger>
        <ContextMenuSubContent>
          <ContextMenuRadioGroup v-model="baseMapId">
            <ContextMenuRadioItem
              v-for="option in basemapOptions"
              :key="option.id"
              :value="option.id"
              @select.prevent
            >
              {{ option.title }}
            </ContextMenuRadioItem>
          </ContextMenuRadioGroup>
        </ContextMenuSubContent>
      </ContextMenuSub>
    </ContextMenuContent>
  </ContextMenu>
</template>
