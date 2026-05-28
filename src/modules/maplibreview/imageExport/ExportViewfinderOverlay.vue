<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { GripVertical } from "@lucide/vue";
import type { Map as MlMap } from "maplibre-gl";
import type {
  SafeZoneInsets,
  ViewportFrame,
} from "@/modules/maplibreview/imageExport/mapLibreExport";

type DragMode = "move" | "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

const MIN_FRAME_SIZE = 80;
const DEFAULT_FRAME_RATIO = 0.8;

const props = defineProps<{
  map: MlMap;
  aspectRatio: number | null;
  fitNonce: number;
  /** Per-edge safe-zone inset fractions, or null to hide the guide. */
  safeZone?: SafeZoneInsets | null;
}>();

const emit = defineEmits<{
  (e: "update:frame", frame: ViewportFrame): void;
}>();

const edgeHandles: DragMode[] = ["n", "s", "e", "w"];
const cornerHandles: DragMode[] = ["ne", "nw", "se", "sw"];

const canvasRect = ref<DOMRect | null>(null);
const frame = ref<ViewportFrame>({ x: 0, y: 0, width: 0, height: 0 });

let resizeObserver: ResizeObserver | null = null;
let dragState: {
  mode: DragMode;
  pointerX: number;
  pointerY: number;
  frame: ViewportFrame;
  pointerId: number;
  target: Element;
} | null = null;

const overlayStyle = computed(() => {
  const rect = canvasRect.value;
  if (!rect) return {};
  return {
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
  };
});

const frameStyle = computed(() => ({
  left: `${frame.value.x}px`,
  top: `${frame.value.y}px`,
  width: `${frame.value.width}px`,
  height: `${frame.value.height}px`,
}));

const outputLabel = computed(
  () => `${Math.round(frame.value.width)} x ${Math.round(frame.value.height)} px`,
);

// Position the safe-zone guide via percentage insets so it scales with the
// frame: top/bottom resolve against the frame's height, left/right against its
// width, keeping each margin proportional at any aspect ratio.
const safeZoneStyle = computed(() => {
  const sz = props.safeZone;
  if (!sz) return null;
  return {
    top: `${sz.top * 100}%`,
    right: `${sz.right * 100}%`,
    bottom: `${sz.bottom * 100}%`,
    left: `${sz.left * 100}%`,
  };
});

function currentCanvasSize() {
  const rect = canvasRect.value;
  return {
    width: Math.max(1, rect?.width ?? 1),
    height: Math.max(1, rect?.height ?? 1),
  };
}

function normalizeFrame(next: ViewportFrame): ViewportFrame {
  const canvas = currentCanvasSize();
  const width = Math.min(canvas.width, Math.max(MIN_FRAME_SIZE, next.width));
  const height = Math.min(canvas.height, Math.max(MIN_FRAME_SIZE, next.height));
  return {
    x: Math.min(canvas.width - width, Math.max(0, next.x)),
    y: Math.min(canvas.height - height, Math.max(0, next.y)),
    width,
    height,
  };
}

function emitFrame() {
  emit("update:frame", { ...frame.value });
}

function setFrame(next: ViewportFrame) {
  frame.value = normalizeFrame(next);
  emitFrame();
}

function fitCurrentView() {
  const canvas = currentCanvasSize();
  setFrame({ x: 0, y: 0, width: canvas.width, height: canvas.height });
}

function resetFrame() {
  const canvas = currentCanvasSize();
  const targetRatio = props.aspectRatio ?? 16 / 9;
  let width = canvas.width * DEFAULT_FRAME_RATIO;
  let height = width / targetRatio;
  if (height > canvas.height * DEFAULT_FRAME_RATIO) {
    height = canvas.height * DEFAULT_FRAME_RATIO;
    width = height * targetRatio;
  }
  setFrame({
    x: (canvas.width - width) / 2,
    y: (canvas.height - height) / 2,
    width,
    height,
  });
}

function syncCanvasRect() {
  const canvas = props.map.getCanvas?.();
  if (!canvas) return;
  canvasRect.value = canvas.getBoundingClientRect();
  if (frame.value.width <= 0 || frame.value.height <= 0) {
    void nextTick(resetFrame);
  } else {
    setFrame(frame.value);
  }
}

function resizeWithAspect(next: ViewportFrame, anchor: ViewportFrame, mode: DragMode) {
  if (!props.aspectRatio || mode === "move") return next;

  const ratio = props.aspectRatio;
  const horizontal = mode.includes("e") || mode.includes("w");
  const vertical = mode.includes("n") || mode.includes("s");
  if (!horizontal && !vertical) return next;

  if (horizontal && !vertical) {
    next.height = next.width / ratio;
    next.y = anchor.y + (anchor.height - next.height) / 2;
  } else if (vertical && !horizontal) {
    next.width = next.height * ratio;
    next.x = anchor.x + (anchor.width - next.width) / 2;
  } else if (
    Math.abs(next.width - anchor.width) >= Math.abs(next.height - anchor.height)
  ) {
    next.height = next.width / ratio;
    if (mode.includes("n")) next.y = anchor.y + anchor.height - next.height;
  } else {
    next.width = next.height * ratio;
    if (mode.includes("w")) next.x = anchor.x + anchor.width - next.width;
  }

  return next;
}

function frameFromDrag(mode: DragMode, start: ViewportFrame, dx: number, dy: number) {
  const next = { ...start };
  if (mode === "move") {
    next.x += dx;
    next.y += dy;
    return next;
  }
  if (mode.includes("e")) next.width += dx;
  if (mode.includes("s")) next.height += dy;
  if (mode.includes("w")) {
    next.x += dx;
    next.width -= dx;
  }
  if (mode.includes("n")) {
    next.y += dy;
    next.height -= dy;
  }
  return resizeWithAspect(next, start, mode);
}

function onPointerMove(event: PointerEvent) {
  if (!dragState || event.pointerId !== dragState.pointerId) return;
  event.preventDefault();
  const dx = event.clientX - dragState.pointerX;
  const dy = event.clientY - dragState.pointerY;
  setFrame(frameFromDrag(dragState.mode, dragState.frame, dx, dy));
}

function onPointerUp(event?: PointerEvent) {
  if (event && dragState && event.pointerId !== dragState.pointerId) return;
  if (dragState) {
    const { target, pointerId } = dragState;
    if ((target as Element & { hasPointerCapture?: (id: number) => boolean })
      .hasPointerCapture?.(pointerId)) {
      (target as Element & { releasePointerCapture: (id: number) => void })
        .releasePointerCapture(pointerId);
    }
  }
  dragState = null;
  window.removeEventListener("pointermove", onPointerMove);
  window.removeEventListener("pointerup", onPointerUp);
  window.removeEventListener("pointercancel", onPointerUp);
}

function startDrag(event: PointerEvent, mode: DragMode) {
  event.preventDefault();
  event.stopPropagation();
  const target = event.currentTarget as Element;
  // Capture the pointer so the drag survives the finger sliding over the
  // MapLibre canvas (which has its own touch handlers) or off-screen.
  target.setPointerCapture?.(event.pointerId);
  dragState = {
    mode,
    pointerX: event.clientX,
    pointerY: event.clientY,
    frame: { ...frame.value },
    pointerId: event.pointerId,
    target,
  };
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", onPointerUp);
}

watch(
  () => props.aspectRatio,
  (ratio, prev) => {
    if (ratio === prev || frame.value.width <= 0) return;
    const centerX = frame.value.x + frame.value.width / 2;
    const centerY = frame.value.y + frame.value.height / 2;
    if (!ratio) return;
    let width = frame.value.width;
    let height = width / ratio;
    if (height > currentCanvasSize().height) {
      height = currentCanvasSize().height;
      width = height * ratio;
    }
    setFrame({ x: centerX - width / 2, y: centerY - height / 2, width, height });
  },
);

watch(() => props.fitNonce, fitCurrentView);

onMounted(() => {
  syncCanvasRect();
  const canvas = props.map.getCanvas?.();
  if (canvas) {
    resizeObserver = new ResizeObserver(syncCanvasRect);
    resizeObserver.observe(canvas);
  }
  // The frame is positioned in canvas pixel coordinates, so it stays put as the
  // map pans/zooms; only a DOM resize moves or resizes the canvas rect. Listening
  // to map "move" would re-emit the frame every animation frame, clearing the
  // export preview on the slightest interaction, so only react to resizes.
  props.map.on("resize", syncCanvasRect);
  window.addEventListener("resize", syncCanvasRect);
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  props.map.off("resize", syncCanvasRect);
  window.removeEventListener("resize", syncCanvasRect);
  onPointerUp();
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="canvasRect"
      class="pointer-events-none fixed z-20"
      :style="overlayStyle"
      aria-hidden="true"
    >
      <div
        class="pointer-events-none absolute border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.65)]"
        :style="frameStyle"
      >
        <!-- Safe-zone guide: marks where to keep key content away from the
             export edges (e.g. platform UI chrome). Purely a visual aid; it
             doesn't affect the exported image. -->
        <div
          v-if="safeZoneStyle"
          class="pointer-events-none absolute border border-dashed border-white/80 [filter:drop-shadow(0_0_1px_rgba(0,0,0,0.7))]"
          :style="safeZoneStyle"
          aria-hidden="true"
        />
        <button
          v-for="handle in edgeHandles"
          :key="handle"
          type="button"
          class="pointer-events-auto absolute touch-none bg-transparent"
          :class="{
            'top-0 left-0 h-6 w-full -translate-y-1/2 cursor-ns-resize': handle === 'n',
            'bottom-0 left-0 h-6 w-full translate-y-1/2 cursor-ns-resize': handle === 's',
            'top-0 right-0 h-full w-6 translate-x-1/2 cursor-ew-resize': handle === 'e',
            'top-0 left-0 h-full w-6 -translate-x-1/2 cursor-ew-resize': handle === 'w',
          }"
          tabindex="-1"
          @pointerdown="startDrag($event, handle)"
        />
        <button
          type="button"
          class="pointer-events-auto absolute top-2 left-2 flex touch-none cursor-move items-center gap-1 rounded bg-black/70 py-1 pr-2 pl-1 text-xs font-medium text-white"
          tabindex="-1"
          @pointerdown="startDrag($event, 'move')"
        >
          <GripVertical class="size-3.5 opacity-80" aria-hidden="true" />
          {{ outputLabel }}
        </button>
        <button
          v-for="handle in cornerHandles"
          :key="handle"
          type="button"
          class="bg-primary pointer-events-auto absolute size-5 touch-none rounded-full border border-white shadow"
          :class="{
            'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ns-resize':
              handle === 'n',
            'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 cursor-ns-resize':
              handle === 's',
            'top-1/2 right-0 translate-x-1/2 -translate-y-1/2 cursor-ew-resize':
              handle === 'e',
            'top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize':
              handle === 'w',
            'top-0 right-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize':
              handle === 'ne',
            'top-0 left-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize':
              handle === 'nw',
            'right-0 bottom-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize':
              handle === 'se',
            'bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize':
              handle === 'sw',
          }"
          tabindex="-1"
          @pointerdown="startDrag($event, handle)"
        />
      </div>
    </div>
  </Teleport>
</template>
