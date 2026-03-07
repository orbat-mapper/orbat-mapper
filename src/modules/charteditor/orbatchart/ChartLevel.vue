<template>
  <g :class="['o-level', levelClass]">
    <rect
      v-if="level.boundingBox"
      :class="['highlight', { 'debug-rect': level.options.debug }]"
      :x="level.boundingBox.x"
      :y="level.boundingBox.y"
      :width="level.boundingBox.width"
      :height="level.boundingBox.height"
      @click="emit('levelclick', levelNumber)"
    />
    <ChartBranch
      v-for="(branch, idx) in level.branches"
      :key="idx"
      :branch="branch"
      @unitclick="onUnitClick"
      @branchclick="onBranchClick"
    />
  </g>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { RenderedLevel, RenderedUnitNode } from "./types";
import ChartBranch from "./ChartBranch.vue";

const props = defineProps<{
  level: RenderedLevel;
}>();

const emit = defineEmits(["unitclick", "branchclick", "levelclick"]);

const levelNumber = computed(() => props.level.branches[0]?.level ?? 0);
const levelClass = computed(() => `o-level-${levelNumber.value}`);

function onUnitClick(unitNode: RenderedUnitNode) {
  emit("unitclick", unitNode);
}

function onBranchClick(parentId: string | number, levelNumber: number) {
  emit("branchclick", parentId, levelNumber);
}
</script>
