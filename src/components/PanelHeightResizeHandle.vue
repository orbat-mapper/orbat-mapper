<script setup lang="ts">
import { ref, unref } from "vue";
import { useThrottleFn } from "@vueuse/core";

interface Props {
  height: number;
  min?: number;
  max?: number;
}

const props = withDefaults(defineProps<Props>(), {
  min: 64,
  max: 320,
});

const emit = defineEmits<{
  update: [height: number];
  dragging: [dragging: boolean];
  reset: [];
}>();

const isDragging = ref(false);
let initialHeight = 0;
let startY = 0;
const el = ref<HTMLDivElement>();

function clampHeight(value: number) {
  return Math.max(props.min, Math.min(props.max, value));
}

function onPointerDown(evt: PointerEvent) {
  const handle = unref(el)!;
  initialHeight = props.height;
  startY = evt.clientY;
  handle.setPointerCapture(evt.pointerId);
  isDragging.value = true;
  emit("dragging", true);
}

function onPointerUp() {
  isDragging.value = false;
  emit("dragging", false);
}

function onPointerMove(evt: PointerEvent) {
  if (!isDragging.value) return;
  emit("update", clampHeight(initialHeight + (startY - evt.clientY)));
}

const throttledOnPointerMove = useThrottleFn(onPointerMove, 10);
</script>

<template>
  <button
    ref="el"
    role="separator"
    aria-orientation="horizontal"
    aria-label="Resize timeline"
    class="pointer-fine:hover:bg-army2 absolute top-0 right-0 left-0 z-30 h-1.5 cursor-row-resize touch-none"
    type="button"
    @dblclick="emit('reset')"
    @pointerdown="onPointerDown"
    @pointerup="onPointerUp"
    @pointermove="throttledOnPointerMove"
  />
</template>
