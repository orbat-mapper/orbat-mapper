<template>
  <button
    ref="el"
    role="separator"
    class="cursor-col-resize"
    @click.stop
    @dblclick="resetWidth"
    @pointerdown="onPointerDown"
    @pointerup="onPointerUp"
    @pointermove="throttledOnPointerMove"
  ></button>
</template>

<script setup lang="ts">
import { ref, unref } from "vue";
import { useThrottleFn } from "@vueuse/core";

const props = defineProps<{ width: number }>();
const emit = defineEmits(["update", "dragging", "reset"]);

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

function resetWidth() {
  emit("reset");
}

const throttledOnPointerMove = useThrottleFn(onPointerMove, 10);
</script>
