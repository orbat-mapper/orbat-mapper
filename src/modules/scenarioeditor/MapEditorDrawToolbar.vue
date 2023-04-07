<template>
  <FloatingPanel
    class="pointer-events-auto flex items-center space-x-0 rounded-md bg-white p-1"
  >
    <p class="pl-2 text-sm font-medium text-gray-500">Draw</p>
    <MainToolbarButton
      title="Keep selected tool active after drawing"
      @click="toggleAddMultiple()"
    >
      <IconLockOutline v-if="addMultiple" class="h-5 w-5" />
      <IconLockOpenVariantOutline v-else class="h-5 w-5" />
    </MainToolbarButton>
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
    <div class="flex items-center -space-x-1">
      <MainToolbarButton title="Edit" @click="startModify()" :active="isModifying">
        <EditIcon class="h-5 w-5" />
      </MainToolbarButton>
      <MainToolbarButton
        title="Delete"
        :disabled="selectedIds.size === 0"
        @click="onFeatureDelete()"
      >
        <DeleteIcon class="h-5 w-5" />
      </MainToolbarButton>
    </div>
    <MainToolbarButton title="Toggle toolbar" @click="store.clearToolbar()">
      <CloseIcon class="h-5 w-5" />
    </MainToolbarButton>
    <div class="prose fixed bottom-4 right-4 hidden lg:block">
      <pre>{{ selectedIds }} {{ scenarioLayers.length }}</pre>
    </div>
  </FloatingPanel>
</template>
<script setup lang="ts">
import {
  IconClose as CloseIcon,
  IconCursorDefaultOutline as SelectIcon,
  IconLockOpenVariantOutline,
  IconLockOutline,
  IconMapMarker as PointIcon,
  IconSquareEditOutline as EditIcon,
  IconTrashCanOutline as DeleteIcon,
  IconVectorCircleVariant as CircleIcon,
  IconVectorLine as LineStringIcon,
  IconVectorSquare as PolygonIcon,
} from "@iconify-prerendered/vue-mdi";
import FloatingPanel from "@/components/FloatingPanel.vue";

import { useMainToolbarStore } from "@/stores/mainToolbarStore";
import { activeMapKey, activeScenarioKey } from "@/components/injects";
import { injectStrict } from "@/utils";
import MainToolbarButton from "@/components/MainToolbarButton.vue";
import { onKeyStroke, useToggle } from "@vueuse/core";
import {
  useScenarioFeatureSelect,
  useScenarioLayers,
} from "@/modules/scenarioeditor/scenarioLayers2";
import { useEditingInteraction } from "@/composables/geoEditing";

const [addMultiple, toggleAddMultiple] = useToggle(false);

const {
  store: { groupUpdate },
} = injectStrict(activeScenarioKey);

const mapRef = injectStrict(activeMapKey);
const {
  scenarioLayers,
  getOlLayerById,
  addOlFeature,
  updateFeatureGeometryFromOlFeature,
  deleteFeature,
} = useScenarioLayers(mapRef.value);
const { selectedIds, selectInteraction } = useScenarioFeatureSelect(mapRef.value, {
  enable: true,
});

let layer: any;
if (scenarioLayers.value?.length > 0) {
  layer = getOlLayerById(scenarioLayers.value[0].id);
}

const { startDrawing, currentDrawType, startModify, isModifying, cancel, isDrawing } =
  useEditingInteraction(mapRef.value, layer, {
    addMultiple: addMultiple,
    select: selectInteraction,
    addHandler: (olFeature, olLayer) => {
      addOlFeature(olFeature, olLayer);
    },
    modifyHandler: (olFeatures) => {
      olFeatures.forEach((f) => updateFeatureGeometryFromOlFeature(f));
    },
  });

const store = useMainToolbarStore();

function onFeatureDelete() {
  groupUpdate(() => {
    [...selectedIds.value.values()].forEach((featureId) => deleteFeature(featureId));
  });
}

onKeyStroke("Escape", (event) => {
  cancel();
});
</script>
