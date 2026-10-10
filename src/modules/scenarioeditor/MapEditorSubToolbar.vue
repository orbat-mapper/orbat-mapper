<script setup lang="ts">
import { useTemplateRef } from "vue";
import { useResizeObserver, useScroll } from "@vueuse/core";
import { ChevronLeft, ChevronRight } from "@lucide/vue";
import { IconClose as CloseIcon } from "@iconify-prerendered/vue-mdi";
import FloatingPanel from "@/components/FloatingPanel.vue";
import MainToolbarButton from "@/components/MainToolbarButton.vue";
import { useMainToolbarStore } from "@/stores/mainToolbarStore";

defineProps<{
  label: string;
  /** The tools carry `ToolbarGroup` captions, which need room above the buttons. */
  captioned?: boolean;
}>();

const store = useMainToolbarStore();

// The tools scroll sideways with the scrollbar hidden. On desktop, scroll buttons like
// the panel tabs' show which way more tools are; Close stays outside the scrolling part
// so it never scrolls away.
const scrollRef = useTemplateRef("scrollRef");
const { x, arrivedState, measure } = useScroll(scrollRef, { behavior: "smooth" });
useResizeObserver(scrollRef, () => measure());
const SCROLL_STEP = 120;
const scrollButtonClass =
  "hover:text-foreground bg-popover text-muted-foreground absolute inset-y-0 z-10 hidden cursor-pointer items-center px-1 disabled:pointer-events-none disabled:opacity-0 @min-[1px]/toolbar:flex";
</script>

<template>
  <FloatingPanel class="pointer-events-auto flex max-w-full items-end rounded-md p-1">
    <div class="relative flex min-w-0">
      <!-- Only inside the desktop toolbar area; phones scroll the tools by swiping. -->
      <button
        type="button"
        :class="[scrollButtonClass, 'left-0 rounded-l-md']"
        :disabled="arrivedState.left"
        aria-label="Scroll left"
        @click="x -= SCROLL_STEP"
      >
        <ChevronLeft class="size-5" />
      </button>
      <div
        ref="scrollRef"
        class="no-scrollbar flex min-w-0 items-center gap-0.5 overflow-x-auto"
        :class="{ '@min-[36rem]/toolbar:pt-4': captioned }"
      >
        <!-- The label gives way to the tools when the map's toolbar area is narrow. -->
        <p
          class="text-muted-foreground hidden shrink-0 px-2 text-sm font-medium @min-[40rem]/toolbar:block"
        >
          {{ label }}
        </p>
        <div
          class="border-border mx-1 hidden h-5 shrink-0 border-l @min-[40rem]/toolbar:block"
        />
        <slot />
      </div>
      <button
        type="button"
        :class="[scrollButtonClass, 'right-0 rounded-r-md']"
        :disabled="arrivedState.right"
        aria-label="Scroll right"
        @click="x += SCROLL_STEP"
      >
        <ChevronRight class="size-5" />
      </button>
    </div>
    <div class="border-border mx-1 mb-2 h-5 shrink-0 border-l" />
    <MainToolbarButton
      title="Close toolbar"
      class="shrink-0"
      @click="store.clearToolbar()"
    >
      <CloseIcon class="size-5" />
    </MainToolbarButton>
  </FloatingPanel>
</template>
