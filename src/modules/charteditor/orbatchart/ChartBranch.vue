<template>
  <g :class="['o-branch', parentClass]">
    <rect
      v-if="branch.boundingBox"
      :class="['highlight', { 'debug-rect': branch.options.debug }]"
      :x="branch.boundingBox.x"
      :y="branch.boundingBox.y"
      :width="branch.boundingBox.width"
      :height="branch.boundingBox.height"
      @click="emit('branchclick', branch.parentId, branch.level)"
    />
    <ChartUnit
      v-for="(unitNode, idx) in branch.units"
      :key="unitNode.unit.id || idx"
      :unit-node="unitNode"
      @unitclick="onUnitClick"
    />
  </g>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { RenderedBranch, RenderedUnitNode } from "./types";
import ChartUnit from "./ChartUnit.vue";

const props = defineProps<{
  branch: RenderedBranch;
}>();

const emit = defineEmits(["unitclick", "branchclick"]);

const parentClass = computed(() => {
  const parentId = props.branch.units[0]?.parent?.unit.id ?? 0;
  return `o-branch-${parentId}`;
});

function onUnitClick(unitNode: RenderedUnitNode) {
  emit("unitclick", unitNode);
}
</script>
