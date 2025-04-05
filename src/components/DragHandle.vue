<template>
  <div
    class="absolute flex items-center justify-center border bg-gray-300 hover:border-red-900 hover:bg-red-900"
    :class="[
      horizontal
        ? 'inset-x-0 bottom-0 h-1 cursor-row-resize'
        : 'inset-y-0 w-1 cursor-col-resize',
      !horizontal && left ? 'left-0' : '',
      !horizontal && !left ? 'right-0' : '',
    ]"
    @mousedown="onButtonDown"
    @touchstart="onButtonDown"
  >
    <div
      class="z-10 flex h-8 flex-none items-center justify-center rounded bg-white shadow-sm"
      :class="{ 'rotate-90 transform': horizontal }"
      style="width: 0.9375rem"
    >
      <svg
        viewBox="0 0 14 24"
        fill="none"
        stroke-width="2"
        stroke="currentColor"
        class="h-3 flex-none text-red-700"
        style="width: 0.4375rem"
      >
        <path d="M 1 0 V 24 M 7 0 V 24 M 13 0 V 24"></path>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { isClient } from "@/utils";

interface Props {
  parentRef: HTMLElement | SVGElement | null | undefined;
  horizontal?: boolean;
  left?: boolean;
}
const props = withDefaults(defineProps<Props>(), { horizontal: false, left: false });

const emit = defineEmits(["resizestart", "resizing", "resizeend"]);

const dragging = ref(false);
const startValue = ref(0);

function onButtonDown(event: Event) {
  event.preventDefault();
  onDragStart(event as any);
  if (isClient) {
    document.addEventListener("mousemove", onDragging);
    document.addEventListener("touchmove", onDragging);
    document.addEventListener("mouseup", onDragEnd);
    document.addEventListener("touchend", onDragEnd);
    document.addEventListener("contextmenu", onDragEnd);
  }
}
function onDragStart(event: MouseEvent | TouchEvent) {
  dragging.value = true;
  if (props.parentRef) {
    startValue.value = props.parentRef.getBoundingClientRect().width;
    emit("resizestart", startValue.value);
  }
  if (event.type === "touchstart") {
    startValue.value = (event as TouchEvent).touches[0].clientX;
  } else {
    startValue.value = (event as MouseEvent).clientX;
  }
}

function onDragging(event: Event) {
  event.preventDefault();
  event.stopPropagation();
  if (dragging.value) {
    let currentValue = 0;
    if (event.type === "touchmove") {
      currentValue = (event as TouchEvent).touches[0].clientX;
    } else {
      currentValue = (event as MouseEvent).clientX;
    }

    const diff = currentValue - startValue.value;

    emit("resizing", diff);
  }
}

function onDragEnd(event: any) {
  dragging.value = false;
  emit("resizeend");
  if (isClient) {
    document.removeEventListener("mousemove", onDragging);
    document.removeEventListener("touchmove", onDragging);
    document.removeEventListener("mouseup", onDragEnd);
    document.removeEventListener("touchend", onDragEnd);
    document.removeEventListener("contextmenu", onDragEnd);
  }
}
</script>
