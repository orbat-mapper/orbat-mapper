<template>
  <transition
    enter-active-class="transition-opacity duration-150"
    leave-active-class="transition-opacity duration-150"
    enter-from-class="opacity-0"
    leave-to-class="opacity-0"
  >
    <div
      v-if="!isMinimized"
      class="bg-popover border-border shadow-xl fixed rounded-lg border"
      :style="{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        zIndex: state.zIndex,
        display: 'flex',
        flexDirection: 'column',
      }"
      @mousedown="bringToFront"
    >
      <div
        class="bg-muted/50 border-border flex items-center justify-between border-b px-3 py-2 cursor-grab active:cursor-grabbing select-none"
        @mousedown.prevent="startDrag"
      >
        <h3 class="text-sm font-semibold truncate">{{ state.title }}</h3>
        <div class="flex items-center gap-1">
          <button
            @click="toggleMinimize()"
            class="text-muted-foreground hover:text-foreground p-1 hover:bg-accent rounded transition-colors"
            title="Minimize"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20 12H4"
              />
            </svg>
          </button>
          <button
            @click="toggleMaximize()"
            class="text-muted-foreground hover:text-foreground p-1 hover:bg-accent rounded transition-colors"
            title="Maximize"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 8V4m0 0h4m-4 0l5 5m11-5v4m0-4h-4m4 0l-5 5M4 20v-4m0 4h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
              />
            </svg>
          </button>
          <button
            @click="closeWindow()"
            class="text-muted-foreground hover:text-foreground hover:bg-destructive/10 p-1 rounded transition-colors"
            title="Close"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-auto">
        <slot />
      </div>

      <div
        class="bg-muted/30 absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
        @mousedown.prevent="startResize"
      />
    </div>
  </transition>

  <div
    v-if="isMinimized"
    class="fixed bottom-0 right-0 mb-2 mr-2 z-50"
    :style="{ zIndex: state.zIndex }"
  >
    <button
      @click="toggleMinimize()"
      class="bg-popover border-border hover:bg-accent text-foreground px-3 py-2 rounded-lg border shadow-md transition-colors"
    >
      {{ state.title }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import type { FloatingWindowState } from "@/composables/useFloatingWindows";

interface Props {
  state: FloatingWindowState;
}

interface Emits {
  (e: "update:position", x: number, y: number): void;
  (e: "update:size", width: number, height: number): void;
  (e: "update:minimized", value: boolean): void;
  (e: "close"): void;
  (e: "bringToFront"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isDragging = ref(false);
const isResizing = ref(false);
const dragStart = reactive({ x: 0, y: 0, windowX: 0, windowY: 0 });
const resizeStart = reactive({ x: 0, y: 0, width: 0, height: 0 });
const isMinimized = ref(props.state.isMinimized);
const isMaximized = ref(false);

const position = reactive({ x: props.state.x, y: props.state.y });
const size = reactive({ width: props.state.width, height: props.state.height });

let prevPosition = { x: position.x, y: position.y };
let prevSize = { width: size.width, height: size.height };

function startDrag(event: MouseEvent) {
  isDragging.value = true;
  dragStart.x = event.clientX;
  dragStart.y = event.clientY;
  dragStart.windowX = position.x;
  dragStart.windowY = position.y;

  const handleMouseMove = (moveEvent: MouseEvent) => {
    const deltaX = moveEvent.clientX - dragStart.x;
    const deltaY = moveEvent.clientY - dragStart.y;

    position.x = dragStart.windowX + deltaX;
    position.y = dragStart.windowY + deltaY;

    // Manter dentro da viewport
    position.x = Math.max(0, position.x);
    position.y = Math.max(0, position.y);

    emit("update:position", position.x, position.y);
  };

  const handleMouseUp = () => {
    isDragging.value = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);
}

function startResize(event: MouseEvent) {
  isResizing.value = true;
  resizeStart.x = event.clientX;
  resizeStart.y = event.clientY;
  resizeStart.width = size.width;
  resizeStart.height = size.height;

  const handleMouseMove = (moveEvent: MouseEvent) => {
    const deltaX = moveEvent.clientX - resizeStart.x;
    const deltaY = moveEvent.clientY - resizeStart.y;

    size.width = Math.max(300, resizeStart.width + deltaX);
    size.height = Math.max(200, resizeStart.height + deltaY);

    emit("update:size", size.width, size.height);
  };

  const handleMouseUp = () => {
    isResizing.value = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);
}

function toggleMinimize() {
  isMinimized.value = !isMinimized.value;
  emit("update:minimized", isMinimized.value);
}

function toggleMaximize() {
  isMaximized.value = !isMaximized.value;

  if (isMaximized.value) {
    prevPosition = { x: position.x, y: position.y };
    prevSize = { width: size.width, height: size.height };

    position.x = 0;
    position.y = 0;
    size.width = window.innerWidth;
    size.height = window.innerHeight;
  } else {
    position.x = prevPosition.x;
    position.y = prevPosition.y;
    size.width = prevSize.width;
    size.height = prevSize.height;
  }

  emit("update:position", position.x, position.y);
  emit("update:size", size.width, size.height);
}

function closeWindow() {
  emit("close");
}

function bringToFront() {
  emit("bringToFront");
}
</script>
