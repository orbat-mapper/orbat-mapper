<template>
  <div
    ref="el"
    role="separator"
    class="absolute top-0 right-0 h-full w-2 cursor-col-resize hover:bg-red-100"
    :class="{ border: isDragging }"
    @pointerdown="onPointerDown"
    @pointerup="onPointerUp"
    @pointermove="onPointerMove"
  ></div>
</template>

<script setup lang="ts">
import { ref, unref } from "vue";

const props = defineProps<{ width: number }>();
const emit = defineEmits(["update"]);

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
}

function onPointerUp(evt: PointerEvent) {
  isDragging.value = false;
}

function onPointerMove(evt: PointerEvent) {
  if (isDragging.value) {
    emit("update", initialWidth + (evt.clientX - startX));
  }
}
</script>
