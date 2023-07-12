<template>
  <button
    ref="el"
    role="separator"
    class="absolute bottom-0 top-0 w-1.5 cursor-col-resize touch-none hover-none:w-3 hover-none:bg-army2 hover-hover:hover:bg-army2"
    :class="left ? 'left-0' : 'right-0'"
    @dblclick="resetWidth"
    @pointerdown="onPointerDown"
    @pointerup="onPointerUp"
    @pointermove="throttledOnPointerMove"
    type="button"
  ></button>
</template>

<script setup lang="ts">
import { ref, unref } from "vue";
import { useThrottleFn } from "@vueuse/core";
interface Props {
  width: number;
  left?: boolean;
}
const props = withDefaults(defineProps<Props>(), { left: false });
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
    emit(
      "update",
      props.left
        ? initialWidth - (evt.clientX - startX)
        : initialWidth + (evt.clientX - startX),
    );
  }
}

function resetWidth() {
  emit("reset");
}

const throttledOnPointerMove = useThrottleFn(onPointerMove, 10);
</script>
