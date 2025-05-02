<template>
  <FloatingPanel class="pointer-events-auto flex items-center space-x-0 rounded-md p-1">
    <p class="text-muted-foreground hidden px-2 text-sm font-medium sm:block">Draw</p>
    <div class="border-border mr-2 h-5 border-l" />
    <MainToolbarButton title="Select" :active="!currentDrawType" @click="cancel()">
      <SelectIcon class="size-5" />
    </MainToolbarButton>
    <MainToolbarButton
      title="Point"
      @click="startDrawing('Point')"
      :active="currentDrawType === 'Point'"
    >
      <PointIcon class="size-5" />
    </MainToolbarButton>
    <MainToolbarButton
      title="Line"
      @click="startDrawing('LineString')"
      :active="currentDrawType === 'LineString'"
    >
      <LineStringIcon class="size-5" />
    </MainToolbarButton>
    <MainToolbarButton
      title="Polygon"
      @click="startDrawing('Polygon')"
      :active="currentDrawType === 'Polygon'"
    >
      <PolygonIcon class="size-5" />
    </MainToolbarButton>

    <MainToolbarButton
      title="Circle"
      @click="startDrawing('Circle')"
      :active="currentDrawType === 'Circle'"
    >
      <CircleIcon class="size-5" />
    </MainToolbarButton>
    <div class="mx-2 h-5 border-l border-gray-300" />
    <div class="flex items-center">
      <MainToolbarButton title="Snap to grid" @click="toggleSnap()" :active="snap">
        <SnapIcon class="size-5" />
      </MainToolbarButton>
      <MainToolbarButton title="Edit" @click="startModify()" :active="isModifying">
        <EditIcon class="size-5" />
      </MainToolbarButton>
      <MainToolbarButton
        title="Modify feature history"
        @click="toggleModifyHistory()"
        :active="modifyHistory"
      >
        <IconClockEdit class="size-5" />
      </MainToolbarButton>
      <MainToolbarButton title="translate" @click="toggleTranslate()" :active="translate">
        <MoveIcon class="size-5" />
      </MainToolbarButton>
      <MainToolbarButton
        title="Delete"
        :disabled="selectedFeatureIds.size === 0"
        @click="onFeatureDelete()"
      >
        <DeleteIcon class="size-5" />
      </MainToolbarButton>
    </div>
    <MainToolbarButton title="Toggle toolbar" @click="store.clearToolbar()">
      <CloseIcon class="size-5" />
    </MainToolbarButton>
  </FloatingPanel>
</template>
<script setup lang="ts">
import {
  IconClose as CloseIcon,
  IconCursorDefaultOutline as SelectIcon,
  IconCursorMove as MoveIcon,
  IconMagnet as SnapIcon,
  IconMapMarker as PointIcon,
  IconSquareEditOutline as EditIcon,
  IconTrashCanOutline as DeleteIcon,
  IconVectorCircleVariant as CircleIcon,
  IconVectorLine as LineStringIcon,
  IconVectorSquare as PolygonIcon,
  IconClockEditOutline as IconClockEdit,
} from "@iconify-prerendered/vue-mdi";
import FloatingPanel from "@/components/FloatingPanel.vue";

import { useMainToolbarStore } from "@/stores/mainToolbarStore";
import {
  activeFeatureSelectInteractionKey,
  activeLayerKey,
  activeMapKey,
  activeScenarioKey,
} from "@/components/injects";
import { injectStrict, nanoid } from "@/utils";
import MainToolbarButton from "@/components/MainToolbarButton.vue";
import { onKeyStroke, useToggle } from "@vueuse/core";
import { useFeatureLayerUtils } from "@/modules/scenarioeditor/featureLayerUtils";
import { useEditingInteraction } from "@/composables/geoEditing";
import { useMapSelectStore } from "@/stores/mapSelectStore";
import { ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useSelectedItems } from "@/stores/selectedStore";
import Feature from "ol/Feature";
import { type AnyVectorLayer } from "@/geo/types";
import { convertOlFeatureToScenarioFeature } from "@/modules/scenarioeditor/scenarioFeatureLayers";

const {
  store: { groupUpdate },
  geo,
} = injectStrict(activeScenarioKey);

const mapRef = injectStrict(activeMapKey);
const featureSelectInteractionRef = injectStrict(activeFeatureSelectInteractionKey);
const activeLayerIdRef = injectStrict(activeLayerKey);

const { getOlLayerById } = useFeatureLayerUtils(mapRef.value);
const { selectedFeatureIds, activeFeatureId } = useSelectedItems();

const { addMultiple, currentDrawStyle } = storeToRefs(useMainToolbarStore());
const [snap, toggleSnap] = useToggle(true);
const [translate, toggleTranslate] = useToggle(false);
const [modifyHistory, toggleModifyHistory] = useToggle(false);

let layer = ref<any>();

watch(
  activeLayerIdRef,
  (layerId) => {
    if (layerId) {
      layer.value = getOlLayerById(layerId);
    } else if (geo.layers.value?.length > 0) {
      layer.value = getOlLayerById(geo.layers.value[0].id);
    }
  },
  { immediate: true },
);

function updateFeatureGeometryFromOlFeature(olFeature: Feature, updateState = false) {
  const t = convertOlFeatureToScenarioFeature(olFeature);
  const id = olFeature.getId();
  if (!id) return;
  const { feature, layer } = geo.getFeatureById(id) || {};
  if (!(feature && layer)) return;
  const dataUpdate = {
    meta: { ...feature.meta, ...t.meta },
    properties: { ...feature.properties, ...t.properties },
    geometry: t.geometry,
  };
  if (updateState) {
    geo.addFeatureStateGeometry(id, t.geometry);
  } else {
    geo.updateFeature(id, dataUpdate, { noEmit: true });
  }
}

function addOlFeature(olFeature: Feature, olLayer: AnyVectorLayer) {
  if (!olFeature.getId()) olFeature.setId(nanoid());

  const scenarioFeature = convertOlFeatureToScenarioFeature(olFeature);
  const scenarioLayer = geo.getLayerById(olLayer.get("id"))!;

  const { feature: lastFeatureInLayer } = geo.getFeatureById(
    scenarioLayer.features[scenarioLayer.features.length - 1],
  );

  const _zIndex = Math.max(
    scenarioLayer.features.length,
    (lastFeatureInLayer?.meta._zIndex || 0) + 1,
  );
  scenarioFeature.meta.name = `${scenarioFeature.meta.type} ${_zIndex + 1}`;
  scenarioFeature.meta._zIndex = _zIndex;
  scenarioFeature.style = currentDrawStyle.value ?? {};

  olFeature.set("_zIndex", _zIndex);
  scenarioLayer && geo.addFeature(scenarioFeature, scenarioLayer.id);
  return scenarioFeature;
}

const { startDrawing, currentDrawType, startModify, isModifying, cancel, isDrawing } =
  useEditingInteraction(mapRef.value, layer.value, {
    addMultiple: addMultiple,
    select: featureSelectInteractionRef.value,
    addHandler: (olFeature, olLayer) => {
      const newFeature = addOlFeature(olFeature, olLayer);
      activeFeatureId.value = newFeature.id;
    },
    modifyHandler: (olFeatures) => {
      olFeatures.forEach((f) =>
        updateFeatureGeometryFromOlFeature(f, modifyHistory.value),
      );
    },
    snap,
    translate,
  });

const store = useMainToolbarStore();
const selectStore = useMapSelectStore();

watch(isDrawing, (isDrawing) => {
  if (isDrawing) {
    translate.value = false;
    selectStore.unitSelectEnabled = false;
    selectStore.featureSelectEnabled = false;
  } else {
    selectStore.unitSelectEnabled = true;
    selectStore.featureSelectEnabled = true;
  }
});

watch(isModifying, (isModifying) => {
  if (isModifying) {
    translate.value = false;
  }
});

watch(translate, (translate) => {
  if (translate) {
    cancel();
  }
});

function onFeatureDelete() {
  groupUpdate(
    () => {
      [...selectedFeatureIds.value.values()].forEach((featureId) =>
        geo.deleteFeature(featureId),
      );
    },
    { label: "batchLayer", value: "dummy" },
  );
}

onKeyStroke("Escape", (event) => {
  cancel();
});
</script>
