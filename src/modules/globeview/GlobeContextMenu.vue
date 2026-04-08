<script setup lang="ts">
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  IconPause,
  IconPlay,
  IconSpeedometer,
  IconSpeedometerSlow,
} from "@iconify-prerendered/vue-mdi";
import { useBaseLayersStore } from "@/stores/baseLayersStore";
import { computed, ref } from "vue";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import {
  GLOBE_VECTOR_BASEMAP_ID,
  getSupportedGlobeBasemaps,
} from "@/modules/globeview/globeBasemaps";
import { usePlaybackStore } from "@/stores/playbackStore";
import { useUiStore } from "@/stores/uiStore";

const baseLayersStore = useBaseLayersStore();
const playback = usePlaybackStore();
const uiSettings = useUiStore();
const baseMapId = defineModel<string>("baseMapId", {
  default: GLOBE_VECTOR_BASEMAP_ID,
});

const basemapOptions = computed(() => getSupportedGlobeBasemaps(baseLayersStore.layers));
const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smallerOrEqual("md");

const triggerRef = ref<HTMLDivElement | null>(null);
const LONG_PRESS_MS = 550;
const MOVE_TOLERANCE_PX = 10;

let longPressTimer: ReturnType<typeof setTimeout> | null = null;
let activePointerId: number | null = null;
let startX = 0;
let startY = 0;

function clearLongPressTimer() {
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }
}

function dispatchSyntheticContextMenu(clientX: number, clientY: number) {
  const trigger = triggerRef.value;
  if (!trigger) return;

  trigger.dispatchEvent(
    new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
      composed: true,
      button: 2,
      buttons: 0,
      clientX,
      clientY,
    }),
  );
}

function onPointerDown(event: PointerEvent) {
  if (event.pointerType === "mouse") return;

  clearLongPressTimer();
  activePointerId = event.pointerId;
  startX = event.clientX;
  startY = event.clientY;

  longPressTimer = setTimeout(() => {
    if (activePointerId !== event.pointerId) return;
    dispatchSyntheticContextMenu(startX, startY);
    activePointerId = null;
    longPressTimer = null;
  }, LONG_PRESS_MS);
}

function onPointerMove(event: PointerEvent) {
  if (event.pointerId !== activePointerId) return;

  const movedX = Math.abs(event.clientX - startX);
  const movedY = Math.abs(event.clientY - startY);
  if (movedX > MOVE_TOLERANCE_PX || movedY > MOVE_TOLERANCE_PX) {
    clearLongPressTimer();
    activePointerId = null;
  }
}

function onPointerEnd(event: PointerEvent) {
  if (event.pointerId !== activePointerId) return;
  clearLongPressTimer();
  activePointerId = null;
}
</script>

<template>
  <ContextMenu>
    <ContextMenuTrigger as-child>
      <div
        ref="triggerRef"
        class="h-full w-full"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerEnd"
        @pointercancel="onPointerEnd"
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
            >
              {{ option.title }}
            </ContextMenuRadioItem>
          </ContextMenuRadioGroup>
        </ContextMenuSubContent>
      </ContextMenuSub>
      <ContextMenuSub>
        <ContextMenuSubTrigger inset><span>Playback</span></ContextMenuSubTrigger>
        <ContextMenuSubContent>
          <ContextMenuItem @select.prevent="playback.togglePlayback()">
            <IconPause v-if="playback.playbackRunning" class="mr-2 h-4 w-4" />
            <IconPlay v-else class="mr-2 h-4 w-4" />
            <span>{{ playback.playbackRunning ? "Pause" : "Play" }}</span>
            <ContextMenuShortcut>k, alt+p</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem @select.prevent="playback.increaseSpeed()">
            <IconSpeedometer class="mr-2 h-4 w-4" />
            <span>Speed up</span>
            <ContextMenuShortcut>&gt;</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem @select.prevent="playback.decreaseSpeed()">
            <IconSpeedometerSlow class="mr-2 h-4 w-4" />
            <span>Slow down</span>
            <ContextMenuShortcut>&lt;</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuCheckboxItem v-model="playback.playbackLooping" @select.prevent>
            Loop playback
          </ContextMenuCheckboxItem>
        </ContextMenuSubContent>
      </ContextMenuSub>
      <ContextMenuSeparator />
      <ContextMenuCheckboxItem v-model="uiSettings.showToolbar" @select.prevent>
        Map toolbar
      </ContextMenuCheckboxItem>
      <ContextMenuCheckboxItem
        v-if="!isMobile"
        v-model="uiSettings.showLeftPanel"
        @select.prevent
      >
        ORBAT panel
      </ContextMenuCheckboxItem>
      <ContextMenuCheckboxItem v-model="uiSettings.showTimeline" @select.prevent>
        Timeline
      </ContextMenuCheckboxItem>
      <ContextMenuCheckboxItem v-model="uiSettings.showOrbatBreadcrumbs" @select.prevent>
        Unit breadcrumbs
      </ContextMenuCheckboxItem>
    </ContextMenuContent>
  </ContextMenu>
</template>
