<script setup lang="ts">
import DotsMenu from "@/components/DotsMenu.vue";
import ChevronPanel from "@/components/ChevronPanel.vue";
import {
  IconClockOutline,
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
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import {
  getScenarioFeatureLayerDragItem,
  isScenarioFeatureDragItem,
} from "@/types/draggables";

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
  dndCleanup = dropTargetForElements({
    element: layerRef.value!,
    canDrop: ({ source }) =>
      isScenarioFeatureDragItem(source.data) &&
      source.data.feature._pid !== props.layer.id,
    onDragEnter: () => {
      isDragOver.value = true;
      props.layer._isOpen = true;
    },
    onDragLeave: () => {
      isDragOver.value = false;
    },
    getData() {
      return getScenarioFeatureLayerDragItem({ layer: props.layer });
    },
    onDrop: () => {
      isDragOver.value = false;
    },
  });
});

onUnmounted(() => {
  dndCleanup();
});
</script>
<template>
  <ChevronPanel :label="layer.name" v-model:open="layer._isOpen">
    <template #label
      ><span
        ref="layerRef"
        @dblclick="activeLayerId = layer.id"
        :class="[
          layer.isHidden ? 'opacity-50' : '',
          layer.id === activeLayerId ? 'text-red-900' : '',
          isDragOver ? 'bg-yellow-400' : '',
        ]"
        >{{ layer.name }}</span
      >
    </template>
    <template #right>
      <div class="flex items-center">
        <button
          type="button"
          @click="activeLayerId = layer.id"
          @keydown.stop
          class="text-gray-500 opacity-0 hover:text-gray-700 group-focus-within:opacity-100 group-hover:opacity-100"
          title="Set as active layer"
        >
          <IconStar v-if="activeLayerId === layer.id" class="h-5 w-5" />
          <IconStarOutline class="h-5 w-5" v-else />
        </button>
        <button
          type="button"
          @click="toggleFeatureLayerVisibility(layer)"
          @keydown.stop
          class="ml-1 text-gray-500 opacity-0 hover:text-gray-700 group-focus-within:opacity-100 group-hover:opacity-100"
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
      class="-ml-5 -mt-6 border"
      @close="editedLayerId = null"
      @update="geo.updateLayer(layer.id, $event)"
    />
    <ul class="-ml-5 -mt-6">
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
        @feature-drop="emit('feature-drop', $event)"
      />
    </ul>
  </ChevronPanel>
</template>
