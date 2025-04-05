<script setup lang="ts">
import DotsMenu from "@/components/DotsMenu.vue";
import ChevronPanel from "@/components/ChevronPanel.vue";
import {
  IconClockOutline,
  IconDrag,
  IconEye,
  IconEyeOff,
  IconStar,
  IconStarOutline,
} from "@iconify-prerendered/vue-mdi";
import EditLayerInlineForm from "@/modules/scenarioeditor/EditLayerInlineForm.vue";
import ScenarioFeatureListItem from "@/modules/scenarioeditor/ScenarioFeatureListItem.vue";
import { NScenarioFeature, NScenarioLayer } from "@/types/internalModels";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { MenuItemData } from "@/components/types";
import {
  ScenarioFeatureActions,
  ScenarioLayerAction,
  ScenarioLayerActions,
} from "@/types/constants";
import { FeatureId } from "@/types/scenarioGeoModels";
import { useSelectedItems } from "@/stores/selectedStore";
import { onMounted, onUnmounted, ref } from "vue";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import {
  getScenarioFeatureLayerDragItem,
  idle,
  isScenarioFeatureDragItem,
  isScenarioFeatureLayerDragItem,
  ItemState,
} from "@/types/draggables";
import { useTimeoutFn } from "@vueuse/core";
import TreeDropIndicator from "@/components/TreeDropIndicator.vue";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  attachClosestEdge,
  extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import DropIndicator from "@/components/DropIndicator.vue";

const props = defineProps<{ layer: NScenarioLayer; features: NScenarioFeature[] }>();
const emit = defineEmits<{
  (
    e: "feature-click",
    feature: NScenarioFeature,
    layer: NScenarioLayer,
    event: MouseEvent,
  ): void;
  (
    e: "feature-double-click",
    feature: NScenarioFeature,
    layer: NScenarioLayer,
    event: MouseEvent,
  ): void;
  (e: "feature-action", featureId: FeatureId, action: ScenarioFeatureActions): void;
  (e: "layer-action", layer: NScenarioLayer, action: ScenarioLayerAction): void;
}>();
const { geo } = injectStrict(activeScenarioKey);

const { selectedFeatureIds, activeFeatureId } = useSelectedItems();

const activeLayerId = defineModel<FeatureId | null | undefined>("activeLayerId");
const editedLayerId = defineModel<FeatureId | null>("editedLayerId");

const layerRef = ref<HTMLElement | null>(null);
const isDragOver = ref(false);
const isDragging = ref(false);

const elRef = ref<HTMLElement | null>(null);
const handleRef = ref<HTMLElement | null>(null);
const itemState = ref<ItemState>(idle);

const {
  isPending,
  start: startOpenTimeout,
  stop: stopOpenTimeout,
} = useTimeoutFn(
  () => {
    props.layer._isOpen = true;
  },
  500,
  { immediate: false },
);

const layerMenuItems: MenuItemData<ScenarioLayerAction>[] = [
  { label: "Zoom to", action: ScenarioLayerActions.Zoom },
  { label: "Set as active", action: ScenarioLayerActions.SetActive },
  { label: "Edit", action: ScenarioLayerActions.Edit },
  { label: "Move up", action: ScenarioLayerActions.MoveUp },
  { label: "Move down", action: ScenarioLayerActions.MoveDown },
  { label: "Delete", action: ScenarioLayerActions.Delete },
];

function toggleFeatureLayerVisibility(layer: NScenarioLayer) {
  geo.updateLayer(layer.id, { isHidden: !layer.isHidden });
}

let dndCleanup: () => void = () => {};
onMounted(() => {
  dndCleanup = combine(
    draggable({
      element: elRef.value!,
      dragHandle: handleRef.value!,
      getInitialData: () => getScenarioFeatureLayerDragItem({ layer: props.layer }),

      onDragStart: () => {
        isDragging.value = true;
      },
      onDrop: () => {
        isDragging.value = false;
      },
    }),
    dropTargetForElements({
      element: elRef.value!,
      canDrop: ({ source }) =>
        (isScenarioFeatureDragItem(source.data) &&
          source.data.feature._pid !== props.layer.id) ||
        (isScenarioFeatureLayerDragItem(source.data) &&
          source.data.layer.id !== props.layer.id),
      onDragEnter: ({ self }) => {
        isDragOver.value = true;
        const closestEdge = extractClosestEdge(self.data);
        itemState.value = { type: "drag-over", closestEdge };
      },
      onDrag: ({ self }) => {
        if (
          isScenarioFeatureDragItem(self.data) &&
          !props.layer._isOpen &&
          !isPending.value
        ) {
          startOpenTimeout();
        }
        if (isScenarioFeatureLayerDragItem(self.data)) {
          const closestEdge = extractClosestEdge(self.data);
          itemState.value = { type: "drag-over", closestEdge: closestEdge };
        }
      },
      onDragLeave: () => {
        isDragOver.value = false;
        stopOpenTimeout();
        itemState.value = idle;
      },
      getData({ input, element, source }) {
        const data = getScenarioFeatureLayerDragItem({ layer: props.layer });
        if (isScenarioFeatureLayerDragItem(source.data)) {
          return attachClosestEdge(data, {
            input,
            element,
            allowedEdges: ["top", "bottom"],
          });
        }
        return data;
      },
      onDrop: ({ source }) => {
        itemState.value = idle;
        isDragOver.value = false;
        stopOpenTimeout();
        if (isScenarioFeatureDragItem(source.data) && !props.layer._isOpen) {
          props.layer._isOpen = true;
        }
      },
    }),
  );
});

onUnmounted(() => {
  dndCleanup();
});
</script>
<template>
  <ChevronPanel
    :label="layer.name"
    v-model:open="layer._isOpen"
    :header-class="['-ml-2', isDragging ? 'opacity-20' : '']"
    v-model:header-ref="elRef"
    :data-layer-id="layer.id"
  >
    <template #left
      ><span ref="handleRef">
        <IconDrag
          class="h-6 w-6 cursor-move text-gray-400 group-focus-within:opacity-100 group-hover:opacity-100 sm:opacity-0"
        /> </span
    ></template>
    <template #label
      ><div
        ref="layerRef"
        @dblclick="activeLayerId = layer.id"
        :class="[
          layer.isHidden ? 'opacity-50' : '',
          layer.id === activeLayerId ? 'text-red-900' : '',
        ]"
      >
        {{ layer.name }}
      </div>
      <DropIndicator
        v-if="itemState.type === 'drag-over' && itemState.closestEdge"
        :edge="itemState.closestEdge"
        gap="0px"
        class="-m-2"
      />
      <TreeDropIndicator
        v-else-if="isDragOver"
        class="-m-2"
        :instruction="{ type: 'make-child', currentLevel: 0, indentPerLevel: 0 }"
      />
    </template>
    <template #right>
      <div class="flex items-center">
        <button
          type="button"
          @click="activeLayerId = layer.id"
          @keydown.stop
          class="text-gray-500 opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 hover:text-gray-700"
          title="Set as active layer"
        >
          <IconStar v-if="activeLayerId === layer.id" class="h-5 w-5" />
          <IconStarOutline class="h-5 w-5" v-else />
        </button>
        <button
          type="button"
          @click="toggleFeatureLayerVisibility(layer)"
          @keydown.stop
          class="ml-1 text-gray-500 opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 hover:text-gray-700"
          title="Toggle layer visibility"
        >
          <IconEyeOff v-if="layer.isHidden" class="h-5 w-5" />
          <IconEye class="h-5 w-5" v-else />
        </button>

        <IconClockOutline
          v-if="layer.visibleFromT || layer.visibleUntilT"
          class="h-5 w-5 text-gray-400"
        />
        <DotsMenu
          class="opacity-0 group-focus-within:opacity-100 group-hover:opacity-100"
          :items="layerMenuItems"
          @action="emit('layer-action', layer, $event)"
        />
      </div>
    </template>
    <EditLayerInlineForm
      v-if="editedLayerId === layer.id"
      :layer="layer"
      class="-mt-6 -ml-5 border"
      @close="editedLayerId = null"
      @update="geo.updateLayer(layer.id, $event)"
    />
    <ul class="-mt-6 -ml-5">
      <ScenarioFeatureListItem
        v-for="feature in features"
        :key="feature.id"
        :feature="feature"
        :layer="layer"
        :selected="selectedFeatureIds.has(feature.id)"
        :active="activeFeatureId === feature.id"
        @feature-click="emit('feature-click', feature, layer, $event)"
        @feature-double-click="emit('feature-double-click', feature, layer, $event)"
        @feature-action="emit('feature-action', feature.id, $event)"
      />
    </ul>
  </ChevronPanel>
</template>
