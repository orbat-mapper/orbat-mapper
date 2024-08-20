<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { IconClockOutline, IconDrag } from "@iconify-prerendered/vue-mdi";
import DotsMenu from "@/components/DotsMenu.vue";
import {
  featureMenuItems,
  getGeometryIcon,
} from "@/modules/scenarioeditor/featureLayerUtils";
import { ScenarioFeatureActions } from "@/types/constants";
import { NScenarioFeature } from "@/types/internalModels";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import type { CleanupFn } from "@atlaskit/pragmatic-drag-and-drop/types";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  attachClosestEdge,
  Edge,
  extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import DropIndicator from "@/components/DropIndicator.vue";
import {
  getScenarioFeatureDragItem,
  idle,
  isScenarioFeatureDragItem,
  ItemState,
} from "@/types/draggables";

interface Props {
  feature: NScenarioFeature;
  layer: any;
  selected?: boolean;
  active?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "feature-click", data: MouseEvent): void;
  (e: "feature-double-click", data: MouseEvent): void;
  (e: "feature-action", data: ScenarioFeatureActions): void;
}>();

const elRef = ref<HTMLElement | null>(null);
const handleRef = ref<HTMLElement | null>(null);
const itemState = ref<ItemState>(idle);
const hidden = computed(() => props.layer.isHidden);

let dndCleanup: CleanupFn = () => {};

onMounted(() => {
  if (!elRef.value) return;
  dndCleanup = combine(
    draggable({
      element: elRef.value,
      dragHandle: handleRef.value!,
      getInitialData: () => getScenarioFeatureDragItem({ feature: props.feature }),
      onDragStart: () => (itemState.value = { type: "dragging" }),
      onDrop: () => (itemState.value = idle),
    }),
    dropTargetForElements({
      element: elRef.value,
      onDragEnter: ({ self }) => {
        const closestEdge = extractClosestEdge(self.data);
        itemState.value = { type: "drag-over", closestEdge };
      },
      onDragLeave: () => (itemState.value = idle),
      canDrop: ({ source }) => {
        const data = source.data;
        if (!isScenarioFeatureDragItem(data)) return false;
        return data.feature !== props.feature;
      },
      getData: ({ input, element }) => {
        const data = getScenarioFeatureDragItem({ feature: props.feature });
        return attachClosestEdge(data, {
          input,
          element,
          allowedEdges: ["top", "bottom"],
        });
      },
      onDrag({ self }) {
        const closestEdge = extractClosestEdge(self.data);
        itemState.value = { type: "drag-over", closestEdge: closestEdge };
      },
      onDrop: () => {
        itemState.value = idle;
      },
    }),
  );
});

onUnmounted(() => {
  dndCleanup();
});
</script>

<template>
  <li
    ref="elRef"
    class="group relative flex select-none items-center justify-between border-l hover:bg-amber-50"
    :data-feature-id="feature.id"
    :class="[
      itemState.type === 'drag-over'
        ? 'bg-gray-100'
        : selected
          ? 'border-yellow-500 bg-yellow-100'
          : 'border-transparent',
      itemState.type === 'dragging' ? 'opacity-20' : '',
    ]"
  >
    <span ref="handleRef">
      <IconDrag
        class="h-6 w-6 cursor-move text-gray-400 group-focus-within:opacity-100 group-hover:opacity-100 sm:opacity-0"
      />
    </span>
    <button
      @click="emit('feature-click', $event)"
      @dblclick="emit('feature-double-click', $event)"
      class="flex flex-auto items-center py-2.5 sm:py-2"
    >
      <component :is="getGeometryIcon(feature)" class="h-5 w-5 text-gray-400" />
      <span
        class="ml-2 text-left text-sm text-gray-700 group-hover:text-gray-900"
        :class="{ 'font-bold': active, 'opacity-50': hidden }"
      >
        {{ feature.meta.name || feature.type || feature.geometry.type }}
      </span>
    </button>
    <div class="relative flex items-center">
      <IconClockOutline
        v-if="feature.meta.visibleFromT || feature.meta.visibleUntilT"
        class="h-5 w-5 text-gray-400"
      />
      <DotsMenu
        :items="featureMenuItems"
        @action="emit('feature-action', $event)"
        class="opacity-0 group-focus-within:opacity-100 group-hover:opacity-100"
      />
    </div>
    <DropIndicator
      v-if="itemState.type === 'drag-over' && itemState.closestEdge"
      :edge="itemState.closestEdge"
      gap="0px"
    />
  </li>
</template>
