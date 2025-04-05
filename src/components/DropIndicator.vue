<script setup lang="ts">
// Copied from https://github.com/frenicohansen/pdnd-vue/blob/main/src/components/DropIndicator.vue
import type { Edge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/types";

const props = withDefaults(
  defineProps<{
    edge: Edge;
    gap?: string;
  }>(),
  { gap: "0px" },
);

type Orientation = "horizontal" | "vertical";

const edgeToOrientationMap: Record<Edge, Orientation> = {
  top: "horizontal",
  bottom: "horizontal",
  left: "vertical",
  right: "vertical",
};

const orientationStyles: Record<Orientation, string> = {
  horizontal:
    "h-(--line-thickness) left-(--terminal-radius) right-0 before:left-(--negative-terminal-size)",
  vertical:
    "w-(--line-thickness) top-(--terminal-radius) bottom-0 before:top-(--negative-terminal-size)",
};

const edgeStyles: Record<Edge, string> = {
  top: "top-(--line-offset) before:top-(--offset-terminal)",
  right: "right-(--line-offset) before:right-(--offset-terminal)",
  bottom: "bottom-(--line-offset) before:bottom-(--offset-terminal)",
  left: "left-(--line-offset) before:left-(--offset-terminal)",
};

const strokeSize = 2;
const terminalSize = 8;
const offsetToAlignTerminalWithLine = (strokeSize - terminalSize) / 2;
</script>

<template>
  <div
    :class="[
      orientationStyles[edgeToOrientationMap[edge]],
      [edgeStyles[edge]],
      'before:content[\'\'] pointer-events-none absolute z-10 box-border bg-blue-700 before:absolute before:h-(--terminal-size) before:w-(--terminal-size) before:rounded-full before:border-(length:--line-thickness) before:border-solid before:border-blue-700',
    ]"
    :style="{
      '--line-thickness': `${strokeSize}px`,
      '--line-offset': `calc(-0.5 * (${props.gap} + ${strokeSize}px))`,
      '--terminal-size': `${terminalSize}px`,
      '--terminal-radius': `${terminalSize / 2}px`,
      '--negative-terminal-size': `-${terminalSize}px`,
      '--offset-terminal': `${offsetToAlignTerminalWithLine}px`,
    }"
  />
</template>
