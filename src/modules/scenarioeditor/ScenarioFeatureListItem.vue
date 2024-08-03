<script setup lang="ts">
import { computed, ref } from "vue";
import { IconClockOutline, IconDrag } from "@iconify-prerendered/vue-mdi";
import DotsMenu from "@/components/DotsMenu.vue";
import type { ScenarioFeature } from "@/types/scenarioGeoModels";
import {
  featureMenuItems,
  getGeometryIcon,
} from "@/modules/scenarioeditor/featureLayerUtils";
import { DragOperations, ScenarioFeatureActions } from "@/types/constants";
import type { DropTarget } from "@/components/types";
import { useDragStore } from "@/stores/dragStore";
import { NScenarioFeature } from "@/types/internalModels";

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
  (
    e: "feature-drop",
    data: {
      feature: NScenarioFeature;
      destinationFeature: NScenarioFeature;
      target: DropTarget;
    },
  ): void;
}>();

const dragStore = useDragStore();

const isDragged = ref(false);
const isDragOver = ref(false);
const isDragOverAbove = ref(false);

const hidden = computed(() => props.layer.isHidden);

function dragStart(event: DragEvent) {
  const { dataTransfer } = event;
  if (dataTransfer) {
    dataTransfer.setData("text/plain", DragOperations.FeatureDrag);
    dataTransfer.dropEffect = "move";
    dragStore.draggedFeature = props.feature;
    setTimeout(() => (isDragged.value = true), 10);
  }
}

function dragEnd(ev: DragEvent) {
  isDragged.value = false;
  dragStore.draggedFeature = null;
}

function onDragOver(event: DragEvent) {
  event.preventDefault();
  isDragOver.value = true;
  // check if the dragged item is above or below the current item
  const rect = (event.target as HTMLElement).getBoundingClientRect();
  const y = event.clientY - rect.top;
  isDragOverAbove.value = y < rect.height / 2;
}

function onDrop(event: DragEvent) {
  if (
    event.dataTransfer?.getData("text") === DragOperations.FeatureDrag &&
    dragStore.draggedFeature
  ) {
    const target = isDragOverAbove.value ? "above" : "below";
    emit("feature-drop", {
      feature: dragStore.draggedFeature,
      destinationFeature: props.feature,
      target,
    });
  }
  isDragOver.value = false;
  isDragOverAbove.value = false;
  isDragged.value = false;
}
</script>

<template>
  <li
    class="group relative flex select-none items-center justify-between border-l pl-1 hover:bg-amber-50"
    :class="[
      isDragOver
        ? 'bg-gray-100'
        : selected
          ? 'border-yellow-500 bg-yellow-100'
          : 'border-transparent',
      isDragged ? 'opacity-20' : '',
      isDragOver
        ? isDragOverAbove
          ? 'border-t-2 border-t-red-600'
          : 'border-b-2 border-b-red-600'
        : '',
    ]"
    @dragover.prevent="onDragOver"
    @dragleave="isDragOver = false"
    @drop.prevent="onDrop"
  >
    <span draggable="true" @dragstart="dragStart" @dragend="dragEnd">
      <IconDrag
        class="h-5 w-5 cursor-move text-gray-400 group-focus-within:opacity-100 group-hover:opacity-100 sm:opacity-0"
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
  </li>
</template>
