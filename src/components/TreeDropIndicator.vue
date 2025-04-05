<template>
  <DropIndicator v-if="instruction.type === 'reorder-above'" edge="top" />
  <DropIndicator v-else-if="instruction.type === 'reorder-below'" edge="bottom" />
  <div
    v-else-if="instruction.type === 'make-child'"
    :class="[outlineStyles]"
    :style="style"
  ></div>
  <div
    v-else-if="instruction.type === 'reparent'"
    :class="[lineStyles, lineAboveStyles]"
    :style="reparentStyle"
  ></div>
</template>

<script lang="ts" setup>
import { computed, toRaw } from "vue";

import type { Instruction } from "@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item";
import DropIndicator from "@/components/DropIndicator.vue";

const props = defineProps<{ instruction: Instruction }>();

const token = (name: string) => {
  const tokens: Record<string, string> = {
    "color.border.warning": "#FFAB00", // Example color, replace with actual value
  };
  return tokens[name] || "";
};
const line = {
  backgroundColor: "red", // Example color, replace with actual value
  thickness: 2, // Example thickness, replace with actual value
};

const style = computed(() => {
  if (props.instruction.type === "instruction-blocked") {
    return {};
  }
  return {
    "--horizontal-indent": `${props.instruction.currentLevel * props.instruction.indentPerLevel}px`,
    "--indicator-color": !isBlocked.value
      ? line.backgroundColor
      : token("color.border.warning"),
  };
});

const isBlocked = computed(() => props.instruction.type === "instruction-blocked");

const reparentStyle = computed(() => {
  if (props.instruction.type !== "reparent") {
    return {};
  }
  return {
    ...style.value,
    "--horizontal-indent": `-${props.instruction.desiredLevel * props.instruction.indentPerLevel}px`,
  };
});

const lineStyles =
  "'before:content[\\'\\'] pointer-events-none top-0 right-0 absolute z-10 box-border bg-blue-700 before:absolute before:h-(--terminal-size) before:w-(--terminal-size) before:rounded-full before:border-(length:--line-thickness) before:border-solid before:border-blue-700'";
const lineAboveStyles =
  "before:top-0 before:transform-translate-x-[-50%] before:transform-translate-y-[-50%] after:top-[-1px]";

const outlineStyles =
  "absolute top-0 right-0 left-0 bottom-0 pointer-events-none border-[2px] border-blue-700 rounded-[3px]";
</script>
