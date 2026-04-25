import type Select from "ol/interaction/Select";
import type OLMap from "ol/Map";
import type VectorLayer from "ol/layer/Vector";
import { computed, ref, shallowRef, watch, type ShallowRef } from "vue";
import { storeToRefs } from "pinia";
import {
  activeFeatureSelectInteractionKey,
  activeLayerKey,
  activeNativeMapKey,
  activeScenarioKey,
  activeScenarioMapEngineKey,
} from "@/components/injects";
import { injectStrict } from "@/utils";
import { useEditingInteraction, type DrawType } from "@/composables/geoEditing";
import { useMapLibreDrawInteraction } from "@/composables/maplibreDrawInteraction";
import { useMainToolbarStore } from "@/stores/mainToolbarStore";
import { useMapSelectStore } from "@/stores/mapSelectStore";
import { useRecordingStore } from "@/stores/recordingStore";
import { useSelectedItems } from "@/stores/selectedStore";
import { useFeatureLayerUtils } from "@/modules/scenarioeditor/featureLayerUtils";
import {
  addOlDrawFeature,
  addScenarioDrawFeature,
  updateScenarioFeatureGeometry,
  updateScenarioFeatureGeometryFromOlFeature,
} from "@/modules/scenarioeditor/scenarioDrawHelpers";
import type { GeometryLayerItem } from "@/types/scenarioLayerItems";
import type { FeatureId } from "@/types/scenarioGeoModels";

function isOpenLayersMap(nativeMap: unknown): nativeMap is OLMap {
  return Boolean(nativeMap && typeof (nativeMap as OLMap).addInteraction === "function");
}

export function useScenarioDraw() {
  const activeScenario = injectStrict(activeScenarioKey);
  const engineRef = injectStrict(activeScenarioMapEngineKey);
  const activeLayerIdRef = injectStrict(activeLayerKey);
  const nativeOpenLayersMapRef = injectStrict(activeNativeMapKey) as ShallowRef<
    OLMap | null | undefined
  >;
  const featureSelectInteractionRef = injectStrict(
    activeFeatureSelectInteractionKey,
  ) as ShallowRef<Select | null | undefined>;

  const toolbarStore = useMainToolbarStore();
  const { addMultiple, currentDrawStyle } = storeToRefs(toolbarStore);
  const { selectedFeatureIds, activeFeatureId } = useSelectedItems();
  const recordingStore = useRecordingStore();
  const { isRecordingGeometry } = storeToRefs(recordingStore);
  const mapSelectStore = useMapSelectStore();

  const snap = ref(true);
  const translate = ref(false);
  const freehand = ref(false);
  const layer = shallowRef<VectorLayer<any>>();
  const mapAdapter = computed(() => engineRef.value?.map);
  const nativeMap = computed(() => mapAdapter.value?.getNativeMap());

  const setSelectionEnabled = (enabled: boolean) => {
    mapSelectStore.unitSelectEnabled = enabled;
    mapSelectStore.featureSelectEnabled = enabled;
  };

  if (nativeOpenLayersMapRef.value) {
    const { getOlLayerById } = useFeatureLayerUtils(nativeOpenLayersMapRef.value);
    watch(
      activeLayerIdRef,
      (layerId) => {
        if (layerId) {
          layer.value = getOlLayerById(layerId);
        } else if (activeScenario.geo.layerItemsLayers.value?.length > 0) {
          layer.value = getOlLayerById(activeScenario.geo.layerItemsLayers.value[0].id);
        }
      },
      { immediate: true },
    );
  }

  const selectedGeometryFeatures = () =>
    [...selectedFeatureIds.value]
      .map(
        (featureId) => activeScenario.geo.getGeometryLayerItemById(featureId).layerItem,
      )
      .filter(Boolean) as GeometryLayerItem[];

  const addFeature = (feature: GeometryLayerItem) => {
    const addedFeature = addScenarioDrawFeature(
      activeScenario,
      feature,
      activeLayerIdRef.value,
      currentDrawStyle.value ?? {},
    );
    if (addedFeature) activeFeatureId.value = addedFeature.id;
  };

  const updateFeatures = (
    updates: Array<{
      featureId: FeatureId;
      geometry: GeometryLayerItem["geometry"];
      geometryMeta?: Partial<GeometryLayerItem["geometryMeta"]>;
    }>,
  ) => {
    activeScenario.store.groupUpdate(
      () => {
        updates.forEach((update) =>
          updateScenarioFeatureGeometry(
            activeScenario,
            update.featureId,
            update.geometry,
            update.geometryMeta ?? {},
            {},
            isRecordingGeometry.value,
            { noEmit: false },
          ),
        );
      },
      { label: "updateFeatureGeometry", value: updates[0]?.featureId ?? "batch" },
    );
  };

  const openLayersInteraction =
    isOpenLayersMap(nativeMap.value) && layer.value
      ? useEditingInteraction(nativeMap.value, layer.value, {
          addMultiple,
          select: featureSelectInteractionRef.value ?? undefined,
          addHandler: (olFeature, olLayer) => {
            const newFeature = addOlDrawFeature(
              activeScenario,
              olFeature,
              olLayer,
              currentDrawStyle.value ?? {},
            );
            if (newFeature) activeFeatureId.value = newFeature.id;
          },
          modifyHandler: (olFeatures) => {
            olFeatures.forEach((feature) =>
              updateScenarioFeatureGeometryFromOlFeature(
                activeScenario,
                feature,
                isRecordingGeometry.value,
              ),
            );
          },
          snap,
          translate,
          freehand,
        })
      : null;

  const mapLibreInteraction =
    mapAdapter.value && !isOpenLayersMap(nativeMap.value)
      ? useMapLibreDrawInteraction(mapAdapter.value, {
          addMultiple,
          snap,
          translate,
          freehand,
          getSelectedFeatures: selectedGeometryFeatures,
          addFeature,
          updateFeatures,
          onDrawingChange: (drawing) => setSelectionEnabled(!drawing),
          onModifyingChange: (modifying) => {
            if (modifying) translate.value = false;
          },
        })
      : null;

  const interaction = openLayersInteraction ?? mapLibreInteraction;
  const currentDrawType = interaction?.currentDrawType ?? ref<DrawType | null>(null);
  const isDrawing = interaction?.isDrawing ?? ref(false);
  const isModifying = interaction?.isModifying ?? ref(false);

  watch(isDrawing, (drawing) => {
    if (drawing) {
      translate.value = false;
      setSelectionEnabled(false);
    } else {
      setSelectionEnabled(true);
    }
  });

  watch(isModifying, (modifying) => {
    if (modifying) translate.value = false;
  });

  watch(translate, (enabled) => {
    if (enabled) interaction?.cancel();
  });

  function deleteSelected() {
    activeScenario.store.groupUpdate(
      () => {
        [...selectedFeatureIds.value.values()].forEach((featureId) =>
          activeScenario.geo.deleteFeature(featureId),
        );
      },
      { label: "batchLayer", value: "dummy" },
    );
  }

  return {
    startDrawing: interaction?.startDrawing ?? (() => {}),
    currentDrawType,
    startModify: interaction?.startModify ?? (() => {}),
    isModifying,
    cancel: interaction?.cancel ?? (() => {}),
    isDrawing,
    deleteSelected,
    snap,
    translate,
    freehand,
  };
}
