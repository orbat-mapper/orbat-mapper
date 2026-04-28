import type Select from "ol/interaction/Select";
import type OLMap from "ol/Map";
import type VectorLayer from "ol/layer/Vector";
import { computed, nextTick, ref, shallowRef, watch, type ShallowRef } from "vue";
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
  const openLayersInteraction = shallowRef<ReturnType<
    typeof useEditingInteraction
  > | null>(null);
  const mapLibreInteraction = shallowRef<ReturnType<
    typeof useMapLibreDrawInteraction
  > | null>(null);
  const interaction = computed(
    () => openLayersInteraction.value ?? mapLibreInteraction.value,
  );

  const setSelectionEnabled = (enabled: boolean) => {
    mapSelectStore.unitSelectEnabled = enabled;
    mapSelectStore.featureSelectEnabled = enabled;
  };

  watch(
    [nativeOpenLayersMapRef, activeLayerIdRef],
    ([olMap, layerId]) => {
      if (!olMap) return;
      const { getOlLayerById } = useFeatureLayerUtils(olMap, { activeScenario });
      if (layerId) {
        layer.value = getOlLayerById(layerId);
      } else if (activeScenario.geo.layerItemsLayers.value?.length > 0) {
        layer.value = getOlLayerById(activeScenario.geo.layerItemsLayers.value[0].id);
      }
    },
    { immediate: true },
  );

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

  // These watchers create map interaction composables once the corresponding
  // engine is ready. The guards keep the lifecycle/event registrations scoped
  // to this setup call while still allowing delayed map initialization.
  watch(
    [nativeMap, layer],
    ([native, activeLayer]) => {
      if (openLayersInteraction.value || !isOpenLayersMap(native) || !activeLayer) {
        return;
      }
      openLayersInteraction.value = useEditingInteraction(native, activeLayer, {
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
      });
    },
    { immediate: true },
  );

  watch(
    [mapAdapter, nativeMap],
    ([adapter, native]) => {
      if (mapLibreInteraction.value || !adapter || isOpenLayersMap(native)) {
        return;
      }
      mapLibreInteraction.value = useMapLibreDrawInteraction(adapter, {
        addMultiple,
        snap,
        translate,
        freehand,
        getSelectedFeatures: selectedGeometryFeatures,
        addFeature,
        updateFeatures,
      });
    },
    { immediate: true },
  );

  const currentDrawType = computed(
    () => interaction.value?.currentDrawType.value ?? null,
  );
  const isDrawing = computed(() => interaction.value?.isDrawing.value ?? false);
  const isModifying = computed(() => interaction.value?.isModifying.value ?? false);

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
    if (enabled) interaction.value?.cancel();
  });

  function withInteraction(
    action: (activeInteraction: NonNullable<typeof interaction.value>) => void,
  ) {
    if (interaction.value) {
      action(interaction.value);
      return;
    }
    void nextTick(() => {
      if (interaction.value) action(interaction.value);
    });
  }

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
    startDrawing: (drawType: DrawType) =>
      withInteraction((activeInteraction) => activeInteraction.startDrawing(drawType)),
    currentDrawType,
    startModify: () =>
      withInteraction((activeInteraction) => activeInteraction.startModify()),
    isModifying,
    cancel: () => withInteraction((activeInteraction) => activeInteraction.cancel()),
    isDrawing,
    deleteSelected,
    snap,
    translate,
    freehand,
  };
}
