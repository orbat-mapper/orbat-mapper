<template>
  <FloatingPanel
    class="pointer-events-auto flex items-center space-x-0 rounded-md bg-white p-1"
  >
    <p class="px-2 text-sm font-medium text-gray-500">Draw</p>
    <div class="h-5 border-l border-gray-300" />
    <MainToolbarButton title="Point" :active="!currentDrawType" @click="cancel()">
      <SelectIcon class="h-5 w-5" />
    </MainToolbarButton>
    <MainToolbarButton
      title="Point"
      @click="startDrawing('Point')"
      :active="currentDrawType === 'Point'"
    >
      <PointIcon class="h-5 w-5" />
    </MainToolbarButton>
    <MainToolbarButton
      title="Line"
      @click="startDrawing('LineString')"
      :active="currentDrawType === 'LineString'"
    >
      <LineStringIcon class="h-5 w-5" />
    </MainToolbarButton>
    <MainToolbarButton
      title="Polygon"
      @click="startDrawing('Polygon')"
      :active="currentDrawType === 'Polygon'"
    >
      <PolygonIcon class="h-5 w-5" />
    </MainToolbarButton>

    <MainToolbarButton
      title="Circle"
      @click="startDrawing('Circle')"
      :active="currentDrawType === 'Circle'"
    >
      <CircleIcon class="h-5 w-5" />
    </MainToolbarButton>
    <div class="h-5 border-l border-gray-300" />
    <div class="flex items-center">
      <MainToolbarButton title="Snap to grid" @click="toggleSnap()" :active="snap">
        <SnapIcon class="h-5 w-5" />
      </MainToolbarButton>
      <MainToolbarButton title="Edit" @click="startModify()" :active="isModifying">
        <EditIcon class="h-5 w-5" />
      </MainToolbarButton>
      <MainToolbarButton
        title="Delete"
        :disabled="selectedFeatureIds.size === 0"
        @click="onFeatureDelete()"
      >
        <DeleteIcon class="h-5 w-5" />
      </MainToolbarButton>
    </div>
    <MainToolbarButton title="Toggle toolbar" @click="store.clearToolbar()">
      <CloseIcon class="h-5 w-5" />
    </MainToolbarButton>
  </FloatingPanel>
</template>
<script setup lang="ts">
import {
  IconClose as CloseIcon,
  IconCursorDefaultOutline as SelectIcon,
  IconMagnet as SnapIcon,
  IconMapMarker as PointIcon,
  IconSquareEditOutline as EditIcon,
  IconTrashCanOutline as DeleteIcon,
  IconVectorCircleVariant as CircleIcon,
  IconVectorLine as LineStringIcon,
  IconVectorSquare as PolygonIcon,
} from "@iconify-prerendered/vue-mdi";
import FloatingPanel from "@/components/FloatingPanel.vue";

import { useMainToolbarStore } from "@/stores/mainToolbarStore";
import {
  activeFeatureSelectInteractionKey,
  activeLayerKey,
  activeMapKey,
  activeScenarioKey,
} from "@/components/injects";
import { injectStrict } from "@/utils";
import MainToolbarButton from "@/components/MainToolbarButton.vue";
import { onKeyStroke, useToggle } from "@vueuse/core";
import { useScenarioLayers } from "@/modules/scenarioeditor/scenarioLayers2";
import { useEditingInteraction } from "@/composables/geoEditing";
import { useMapSelectStore } from "@/stores/mapSelectStore";
import { ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useSelectedItems } from "@/stores/selectedStore";

const {
  store: { groupUpdate },
} = injectStrict(activeScenarioKey);

const mapRef = injectStrict(activeMapKey);
const featureSelectInteractionRef = injectStrict(activeFeatureSelectInteractionKey);
const activeLayerIdRef = injectStrict(activeLayerKey);

const {
  scenarioLayers,
  getOlLayerById,
  addOlFeature,
  updateFeatureGeometryFromOlFeature,
  deleteFeature,
} = useScenarioLayers(mapRef.value);
const { selectedFeatureIds, activeFeatureId } = useSelectedItems();

const { addMultiple } = storeToRefs(useMainToolbarStore());
const [snap, toggleSnap] = useToggle(true);
let layer = ref<any>();

watch(
  activeLayerIdRef,
  (layerId) => {
    if (layerId) {
      layer.value = getOlLayerById(layerId);
    } else if (scenarioLayers.value?.length > 0) {
      layer.value = getOlLayerById(scenarioLayers.value[0].id);
    }
  },
  { immediate: true },
);

const { startDrawing, currentDrawType, startModify, isModifying, cancel, isDrawing } =
  useEditingInteraction(mapRef.value, layer.value, {
    addMultiple: addMultiple,
    select: featureSelectInteractionRef.value,
    addHandler: (olFeature, olLayer) => {
      const newFeature = addOlFeature(olFeature, olLayer);
      activeFeatureId.value = newFeature.id;
    },
    modifyHandler: (olFeatures) => {
      olFeatures.forEach((f) => updateFeatureGeometryFromOlFeature(f));
    },
    snap,
  });

const store = useMainToolbarStore();
const selectStore = useMapSelectStore();

watch(isDrawing, (isDrawing) => {
  if (isDrawing) {
    selectStore.unitSelectEnabled = false;
    selectStore.featureSelectEnabled = false;
  } else {
    selectStore.unitSelectEnabled = true;
    selectStore.featureSelectEnabled = true;
  }
});

function onFeatureDelete() {
  groupUpdate(() => {
    [...selectedFeatureIds.value.values()].forEach((featureId) =>
      deleteFeature(featureId),
    );
  });
}

onKeyStroke("Escape", (event) => {
  cancel();
});
</script>
