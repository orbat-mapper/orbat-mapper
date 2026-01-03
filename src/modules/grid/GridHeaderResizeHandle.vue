<script setup lang="ts">
import { ref, unref } from "vue";
import { useThrottleFn } from "@vueuse/core";

const props = defineProps<{ width: number }>();
const emit = defineEmits(["update", "dragging"]);

const isDragging = ref(false);
let initialWidth = 0;
let startX = 0;
const el = ref<HTMLDivElement>();

function onPointerDown(evt: PointerEvent) {
  const e = unref(el)!;
  initialWidth = props.width;
  startX = evt.clientX;
  e.setPointerCapture(evt.pointerId);
  isDragging.value = true;
  emit("dragging", isDragging.value);
}

function onPointerUp(evt: PointerEvent) {
  isDragging.value = false;
  emit("dragging", isDragging.value);
}

function onPointerMove(evt: PointerEvent) {
  if (isDragging.value) {
    emit("update", initialWidth + (evt.clientX - startX));
  }
}

const throttledOnPointerMove = useThrottleFn(onPointerMove, 10);
</script>

<template>
  <div
    ref="el"
    role="separator"
    class="absolute top-0 right-0 h-full w-4 cursor-col-resize hover:bg-red-100 sm:w-2"
    :class="{ border: isDragging }"
    @click.stop
    @pointerdown="onPointerDown"
    @pointerup="onPointerUp"
    @pointermove="throttledOnPointerMove"
  ></div>
</template>
