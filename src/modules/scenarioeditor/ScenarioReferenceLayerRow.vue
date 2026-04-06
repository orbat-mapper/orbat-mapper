<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { IconDrag, IconEye, IconEyeOff } from "@iconify-prerendered/vue-mdi";
import { Button } from "@/components/ui/button";
import DotsMenu from "@/components/DotsMenu.vue";
import DropIndicator from "@/components/DropIndicator.vue";
import type { MenuItemData } from "@/components/types";
import type { ScenarioMapLayer, FeatureId } from "@/types/scenarioGeoModels";
import type { ScenarioMapLayerAction } from "@/types/constants";
import { getMapLayerIcon } from "@/modules/scenarioeditor/scenarioMapLayers";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  attachClosestEdge,
  extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import {
  getScenarioMapLayerDragItem,
  idle,
  isScenarioFeatureLayerDragItem,
  isScenarioMapLayerDragItem,
  type ItemState,
} from "@/types/draggables";

const props = defineProps<{
  mapLayer: ScenarioMapLayer;
  label: string;
  activeMapLayerId: FeatureId | null | undefined;
  selected: boolean;
  menuItems: MenuItemData<ScenarioMapLayerAction>[];
}>();

const emit = defineEmits<{
  (e: "click", event: MouseEvent): void;
  (e: "dblclick"): void;
  (e: "toggle-visibility"): void;
  (e: "action", action: ScenarioMapLayerAction): void;
}>();

const elRef = ref<HTMLElement | null>(null);
const handleRef = ref<HTMLElement | null>(null);
const itemState = ref<ItemState>(idle);
const isDragging = ref(false);

let dndCleanup: () => void = () => {};
onMounted(() => {
  dndCleanup = combine(
    draggable({
      element: elRef.value!,
      dragHandle: handleRef.value!,
      getInitialData: () => getScenarioMapLayerDragItem({ mapLayer: props.mapLayer }),
      onDragStart: () => (isDragging.value = true),
      onDrop: () => (isDragging.value = false),
    }),
    dropTargetForElements({
      element: elRef.value!,
      canDrop: ({ source }) =>
        (isScenarioMapLayerDragItem(source.data) &&
          source.data.mapLayer.id !== props.mapLayer.id) ||
        isScenarioFeatureLayerDragItem(source.data),
      getData: ({ input, element }) =>
        attachClosestEdge(getScenarioMapLayerDragItem({ mapLayer: props.mapLayer }), {
          input,
          element,
          allowedEdges: ["top", "bottom"],
        }),
      onDragEnter: ({ self }) => {
        const closestEdge = extractClosestEdge(self.data);
        itemState.value = { type: "drag-over", closestEdge };
      },
      onDrag: ({ self }) => {
        const closestEdge = extractClosestEdge(self.data);
        itemState.value = { type: "drag-over", closestEdge };
      },
      onDragLeave: () => (itemState.value = idle),
      onDrop: () => (itemState.value = idle),
    }),
  );
});

onUnmounted(() => dndCleanup());
</script>

<template>
  <div
    ref="elRef"
    class="border-border group relative border-b py-2"
    :class="isDragging ? 'opacity-20' : ''"
    :data-map-layer-id="mapLayer.id"
  >
    <h3 class="group -my-3 -ml-2 flex w-full items-center justify-between py-3">
      <span ref="handleRef" class="cursor-move">
        <IconDrag
          class="text-muted-foreground h-6 w-6 group-focus-within:opacity-100 group-hover:opacity-100 sm:opacity-0"
        />
      </span>
      <button
        type="button"
        class="group text-muted-foreground relative flex min-w-0 flex-auto items-center text-sm select-none"
        @click="emit('click', $event)"
        @dblclick="emit('dblclick')"
      >
        <component
          :is="getMapLayerIcon(mapLayer)"
          class="text-muted-foreground size-5 flex-none"
        />
        <span
          class="ml-2 min-w-0 flex-auto truncate text-left font-bold"
          :class="[
            mapLayer.isHidden ? 'opacity-50' : '',
            activeMapLayerId === mapLayer.id
              ? 'dark:text-army2 text-red-800'
              : 'text-foreground',
            selected ? 'underline underline-offset-4' : '',
          ]"
        >
          {{ label }}
        </span>
        <span
          v-if="mapLayer._isTemporary"
          class="bg-muted text-muted-foreground ml-2 rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase"
          title="Temporary layer. Not saved"
          >Temp</span
        >
      </button>
      <span class="relative ml-6 flex shrink-0 items-center">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          @click="emit('toggle-visibility')"
          @keydown.stop
          class="opacity-0 group-focus-within:opacity-100 group-hover:opacity-100"
          title="Toggle layer visibility"
        >
          <IconEyeOff v-if="mapLayer.isHidden" class="size-5" />
          <IconEye v-else class="size-5" />
        </Button>
        <DotsMenu
          :items="menuItems"
          @action="emit('action', $event)"
          class="opacity-0 group-focus-within:opacity-100 group-hover:opacity-100"
        />
      </span>
    </h3>
    <DropIndicator
      v-if="itemState.type === 'drag-over' && itemState.closestEdge"
      :edge="itemState.closestEdge"
      gap="0px"
    />
  </div>
</template>
