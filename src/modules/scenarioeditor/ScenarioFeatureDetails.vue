<script setup lang="ts">
import {
  IconImage as ImageIcon,
  IconMagnifyExpand as ZoomIcon,
  IconPalette as StyleIcon,
  IconPencil as EditIcon,
} from "@iconify-prerendered/vue-mdi";
import { GlobalEvents } from "vue-global-events";

import { injectStrict } from "@/utils";
import { activeScenarioKey, activeScenarioMapEngineKey } from "@/components/injects";
import { computed, defineAsyncComponent, ref, watch } from "vue";
import { getGeometryIcon } from "@/modules/scenarioeditor/featureLayerUtils";
import { useDebounceFn } from "@vueuse/core";
import ScenarioFeatureMarkerSettings from "@/modules/scenarioeditor/ScenarioFeatureMarkerSettings.vue";
import ScenarioFeatureStrokeSettings from "@/modules/scenarioeditor/ScenarioFeatureStrokeSettings.vue";
import ScenarioFeatureArrowSettings from "@/modules/scenarioeditor/ScenarioFeatureArrowSettings.vue";
import ScenarioFeatureFillSettings from "@/modules/scenarioeditor/ScenarioFeatureFillSettings.vue";
import EditableLabel from "@/components/EditableLabel.vue";
import { type SelectedScenarioFeatures, useSelectedItems } from "@/stores/selectedStore";
import IconButton from "@/components/IconButton.vue";
import { TabsContent } from "@/components/ui/tabs";
import ScrollTabs from "@/components/ScrollTabs.vue";
import { useUiStore } from "@/stores/uiStore";
import { useTabStore } from "@/stores/tabStore";
import { useMainToolbarStore } from "@/stores/mainToolbarStore";
import { storeToRefs } from "pinia";
import { useScenarioFeatureActions } from "@/composables/scenarioActions";
import { renderMarkdown } from "@/composables/formatting";
import EditMetaForm from "@/modules/scenarioeditor/EditMetaForm.vue";
import EditMediaForm from "@/modules/scenarioeditor/EditMediaForm.vue";
import type { GeometryLayerItemUpdate, MediaUpdate } from "@/types/internalModels";
import type { UpdateOptions } from "@/scenariostore/geo";
import { inputEventFilter } from "@/components/helpers";
import ScenarioFeatureDropdownMenu from "@/modules/scenarioeditor/ScenarioFeatureDropdownMenu.vue";
import type { ScenarioFeatureActions } from "@/types/constants";
import { useNotifications } from "@/composables/notifications";
import { layerItemsToGeoJsonString } from "@/modules/scenarioeditor/featureLayerUtils";
import ScenarioFeatureState from "@/modules/scenarioeditor/ScenarioFeatureState.vue";
import ScenarioFeatureTextSettings from "@/modules/scenarioeditor/ScenarioFeatureTextSettings.vue";
import ScenarioFeatureVisibilitySettings from "@/modules/scenarioeditor/ScenarioFeatureVisibilitySettings.vue";
import ScenarioFeatureGeometryStats from "@/modules/scenarioeditor/ScenarioFeatureGeometryStats.vue";
import ScenarioFeaturesGeometryStats from "@/modules/scenarioeditor/ScenarioFeaturesGeometryStats.vue";
import PanelDataGrid from "@/components/PanelDataGrid.vue";
import { Button } from "@/components/ui/button";
import type { NGeometryLayerItem } from "@/types/internalModels";
import DetailsPanelHeader from "@/modules/scenarioeditor/DetailsPanelHeader.vue";
import PanelTitle from "@/modules/scenarioeditor/PanelTitle.vue";
import UnitTreeSelect from "@/components/UnitTreeSelect.vue";
import { useRootUnitIds } from "@/composables/scenarioUtils";
import {
  createUnitTrackStatesFromFeature,
  isAssignableTrackFeature,
} from "@/importexport/unitTrackAssignment";
import type { Feature } from "geojson";
import { convertSpeedToMetric } from "@/utils/convert";

interface Props {
  selectedIds: SelectedScenarioFeatures;
}

const props = defineProps<Props>();

const FeatureTransformations = defineAsyncComponent(
  () => import("@/modules/scenarioeditor/FeatureTransformations.vue"),
);

const { geo, store, time, unitActions } = injectStrict(activeScenarioKey);
const { groupUpdate } = store;
const engineRef = injectStrict(activeScenarioMapEngineKey);

const { send: notify } = useNotifications();
const featureActions = useScenarioFeatureActions();
const { selectedFeatureIds, clear: clearSelection } = useSelectedItems();
const uiStore = useUiStore();
const { featureDetailsTab: selectedTab } = storeToRefs(useTabStore());
const toolbarStore = useMainToolbarStore();
const { rootUnitIds } = useRootUnitIds();

const DEFAULT_ASSIGN_SPEED_M_S = convertSpeedToMetric(30, "km/h");

const feature = computed(() => {
  if (props.selectedIds.size === 1) {
    return geo.getGeometryLayerItemById(props.selectedIds.values().next().value!)
      .layerItem as NGeometryLayerItem | undefined;
  }
  return null;
});

const selectedFeatures = computed<NGeometryLayerItem[]>(() => {
  if (props.selectedIds.size <= 1) return [];
  return [...props.selectedIds]
    .map((id) => geo.getGeometryLayerItemById(id)?.layerItem)
    .filter((f): f is NGeometryLayerItem => !!f);
});

const featureName = ref("DD");
const featureDescription = ref();
const hDescription = computed(() => renderMarkdown(feature.value?.description || ""));

const isEditMode = ref(false);

function removeMedia() {
  feature.value && geo.updateFeature(feature.value.id, { media: [] });
}

function toggleEditMode() {
  isEditMode.value = !isEditMode.value;
  isEditMediaMode.value = false;
  if (isEditMode.value) {
    selectedTab.value = 1;
  }
}

const isEditMediaMode = ref(false);

function toggleEditMediaMode() {
  isEditMediaMode.value = !isEditMediaMode.value;
  isEditMode.value = false;
  if (isEditMediaMode.value) {
    selectedTab.value = 1;
  }
}

function showStylePanel() {
  selectedTab.value = 0;
}

watch(
  () => feature.value?.name,
  (v) => {
    featureName.value = v ?? "";
    featureDescription.value = feature.value?.description ?? "";
  },
  { immediate: true },
);

const geometryType = computed(() => feature.value?.geometryMeta.geometryKind);
const hasStroke = computed(() => geometryType.value !== "Point");
const hasArrows = computed(() => geometryType.value === "LineString");
const hasFill = computed(
  () => !["Point", "LineString"].includes(geometryType.value || ""),
);
const canTransformFeature = computed(() =>
  Boolean(engineRef.value?.layers.capabilities.featureTransform),
);
const canAssignFeatureToUnit = computed(
  () => !!feature.value && isAssignableTrackFeature(toGeoJSONFeature(feature.value)),
);
const selectedAssignmentUnitId = ref<string | null>(null);
const assignmentUnitId = computed({
  get: () => selectedAssignmentUnitId.value ?? rootUnitIds.value[0] ?? null,
  set: (unitId: string | null) => {
    selectedAssignmentUnitId.value = unitId;
  },
});

watch(canTransformFeature, (enabled) => {
  if (!enabled && selectedTab.value === 3) {
    selectedTab.value = 0;
  }
});

const isMultiMode = computed(() => selectedFeatureIds.value.size > 1);

const tabList = computed(() => {
  const base = [
    { label: "Style", value: "0" },
    { label: "Details", value: "1" },
    { label: "State", value: "2" },
  ];
  if (canTransformFeature.value) {
    base.push({ label: "Transform", value: "3" });
  }
  if (uiStore.debugMode) {
    base.push({ label: "Debug", value: "4" });
  }
  return base;
});

const selectedTabString = computed({
  get: () => selectedTab.value.toString(),
  set: (v) => {
    selectedTab.value = Number(v);
  },
});

const isEditing = computed(() => isEditMode.value || isEditMediaMode.value);
const media = computed(() => {
  const { media = [] } = feature.value || {};
  return media.length ? media[0] : null;
});

function updateValue(value: string) {
  feature.value && geo.updateFeature(feature.value?.id, { name: value });
}

const debouncedResetMap = useDebounceFn(
  () => engineRef.value?.resumeFeatureSelection(),
  3000,
);

let previewSnapshots: Map<string | number, Record<string, any>> | null = null;

function selectedFeatureIdList(): (string | number)[] {
  if (isMultiMode.value) return [...props.selectedIds.values()];
  return feature.value?.id ? [feature.value.id] : [];
}

function doUpdateFeature(data: GeometryLayerItemUpdate, options?: UpdateOptions) {
  const ids = selectedFeatureIdList();
  engineRef.value?.suspendFeatureSelection();

  if (options?.undoable === false && data.style && !previewSnapshots) {
    previewSnapshots = new Map();
    for (const id of ids) {
      const item = geo.getGeometryLayerItemById(id)?.layerItem;
      if (item) previewSnapshots.set(id, { ...item.style });
    }
  }

  const callUpdate = options
    ? (f: string | number) => geo.updateFeature(f, data, options)
    : (f: string | number) => geo.updateFeature(f, data);

  if (ids.length > 1) {
    if (options?.undoable === false) {
      ids.forEach(callUpdate);
    } else {
      groupUpdate(() => ids.forEach(callUpdate), {
        label: "batchLayer",
        value: "nil",
      });
    }
  } else if (ids.length === 1) {
    callUpdate(ids[0]);
  }
  if (feature.value) {
    toolbarStore.currentDrawStyle = { ...feature.value.style };
  }
  debouncedResetMap();
}

function doCommitFeature() {
  if (!previewSnapshots) return;
  const snapshots = previewSnapshots;
  previewSnapshots = null;

  const finalStyles = new Map<string | number, Record<string, any>>();
  for (const id of snapshots.keys()) {
    const item = geo.getGeometryLayerItemById(id)?.layerItem;
    if (item) finalStyles.set(id, { ...item.style });
  }

  for (const [id, orig] of snapshots) {
    geo.updateFeature(id, { style: orig }, { undoable: false, noEmit: true });
  }

  const ids = [...finalStyles.keys()];
  if (ids.length > 1) {
    groupUpdate(
      () => ids.forEach((id) => geo.updateFeature(id, { style: finalStyles.get(id)! })),
      { label: "batchLayer", value: "nil" },
    );
  } else if (ids.length === 1) {
    geo.updateFeature(ids[0], { style: finalStyles.get(ids[0])! });
  }
}

function doMetaUpdate(
  data: Pick<GeometryLayerItemUpdate, "name" | "description" | "externalUrl">,
) {
  if (data) doUpdateFeature(data);
  isEditMode.value = false;
}

function updateMedia(mediaUpdate: MediaUpdate) {
  if (!mediaUpdate || !feature.value) return;
  const { media = [] } = feature.value;
  const newMedia = { ...media[0], ...mediaUpdate };
  geo.updateFeature(feature.value.id, { media: [newMedia] });
  isEditMediaMode.value = false;
}

function doZoom() {
  featureActions.onFeatureAction([...props.selectedIds], "zoom");
}

function onAction(action: ScenarioFeatureActions) {
  if (action === "removeMedia") {
    removeMedia();
    return;
  }
  if (action === "copyAsGeoJson") {
    const features = [...props.selectedIds]
      .map((id) => geo.getGeometryLayerItemById(id)?.layerItem)
      .filter((f) => !!f);
    if (features.length) {
      navigator.clipboard.writeText(layerItemsToGeoJsonString(features));
      notify({ message: "Copied GeoJSON to clipboard" });
    }
    return;
  }
  featureActions.onFeatureAction([...props.selectedIds], action);
}

function toGeoJSONFeature(item: NGeometryLayerItem): Feature {
  return {
    type: "Feature",
    properties: item.userData ?? {},
    geometry: item.geometry,
  };
}

function assignFeatureToUnit() {
  if (!feature.value || !assignmentUnitId.value) return;
  const geoJsonFeature = toGeoJSONFeature(feature.value);
  if (!isAssignableTrackFeature(geoJsonFeature)) return;

  const unit = store.state.unitMap[assignmentUnitId.value];
  if (!unit) return;

  const speedValue = unit.properties?.averageSpeed || unit.properties?.maxSpeed;
  const averageSpeed = speedValue
    ? convertSpeedToMetric(speedValue.value, speedValue.uom)
    : DEFAULT_ASSIGN_SPEED_M_S;

  const result = createUnitTrackStatesFromFeature(
    geoJsonFeature,
    store.state.currentTime,
    {
      addStartPosition: !unit.location && !unit._state?.location,
      averageSpeed,
    },
  );
  if (!result.states.length) {
    notify({ message: "No track positions were available to assign.", type: "warning" });
    return;
  }

  groupUpdate(() => {
    result.states.forEach((state) => {
      unitActions.addUnitStateEntry(assignmentUnitId.value!, state, true);
    });
  });
  time.setCurrentTime(store.state.currentTime);

  const skippedMessage = result.skippedPoints
    ? ` ${result.skippedPoints} route points were skipped.`
    : "";
  notify({
    message: `Assigned ${result.states.length} track positions to unit.${skippedMessage}`,
    type: "success",
  });
}
</script>
<template>
  <div>
    <DetailsPanelHeader :media="media" leading-align="center">
      <template v-if="feature" #leading>
        <component :is="getGeometryIcon(feature)" class="text-muted-foreground size-6" />
      </template>
      <template #title>
        <EditableLabel v-if="feature" v-model="featureName" @update-value="updateValue" />
        <PanelTitle v-else-if="isMultiMode">
          {{ selectedFeatureIds.size }} features selected
        </PanelTitle>
      </template>
      <template #trailing>
        <Button
          v-if="isMultiMode"
          variant="outline"
          type="button"
          size="sm"
          @click="clearSelection()"
        >
          Clear
        </Button>
        <ScenarioFeatureDropdownMenu @action="onAction" />
      </template>
      <template #actions>
        <IconButton @click="doZoom()" title="Zoom to feature">
          <ZoomIcon class="size-5" />
        </IconButton>
        <IconButton @click="showStylePanel()" title="Change feature style">
          <StyleIcon class="size-5" />
        </IconButton>
        <IconButton title="Edit feature data" @click="toggleEditMode()">
          <EditIcon class="size-5" />
        </IconButton>
        <IconButton title="Add/modify image" @click="toggleEditMediaMode()">
          <ImageIcon class="size-5" />
        </IconButton>
      </template>
    </DetailsPanelHeader>
    <div class="-mx-4">
      <ScrollTabs :items="tabList" v-model="selectedTabString">
        <TabsContent value="0" class="mx-4">
          <PanelDataGrid class="mt-4">
            <ScenarioFeatureVisibilitySettings
              v-if="feature"
              :feature="feature"
              @update="doUpdateFeature"
            />
            <ScenarioFeatureMarkerSettings
              v-if="
                feature &&
                (geometryType === 'Point' || geometryType === 'GeometryCollection')
              "
              :feature="feature"
              @update="doUpdateFeature"
            />
            <ScenarioFeatureStrokeSettings
              v-if="feature && hasStroke"
              :feature="feature"
              @update="doUpdateFeature"
              @commit="doCommitFeature"
            />
            <ScenarioFeatureArrowSettings
              v-if="feature && hasArrows"
              :feature="feature"
              @update="doUpdateFeature"
            />
            <ScenarioFeatureFillSettings
              v-if="feature && hasFill"
              :feature="feature"
              @update="doUpdateFeature"
              @commit="doCommitFeature"
            />
            <ScenarioFeatureTextSettings
              v-if="feature && geometryType !== 'Circle'"
              :feature="feature"
              @update="doUpdateFeature"
            />
          </PanelDataGrid>
        </TabsContent>
        <TabsContent value="1" class="mx-4">
          <ScenarioFeatureGeometryStats v-if="feature && !isEditing" :feature="feature" />
          <ScenarioFeaturesGeometryStats
            v-else-if="isMultiMode && selectedFeatures.length"
            :features="selectedFeatures"
          />
          <div
            v-if="!isEditing && feature?.description"
            class="prose dark:prose-invert mt-4"
          >
            <div class="prose prose-sm dark:prose-invert" v-html="hDescription"></div>
          </div>
          <div v-else-if="isEditMode" class="mt-4">
            <EditMetaForm
              :item="feature"
              @update="doMetaUpdate"
              @cancel="toggleEditMode()"
            />
          </div>
          <div v-else-if="isEditMediaMode" class="mt-4">
            <EditMediaForm
              :media="media"
              @cancel="toggleEditMediaMode()"
              @update="updateMedia"
            />
          </div>
        </TabsContent>
        <TabsContent value="2" class="mx-4">
          <ScenarioFeatureState v-if="feature" :feature="feature" />
          <div
            v-if="feature && canAssignFeatureToUnit"
            class="border-border mt-4 space-y-3 border-t pt-4"
          >
            <UnitTreeSelect
              label="Assign track/route to unit"
              :units="rootUnitIds"
              :unit-map="store.state.unitMap"
              v-model="assignmentUnitId"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              :disabled="!assignmentUnitId"
              @click="assignFeatureToUnit"
            >
              Assign to unit
            </Button>
          </div>
        </TabsContent>
        <TabsContent v-if="canTransformFeature" value="3" class="mx-4">
          <FeatureTransformations class="mt-4" />
        </TabsContent>
        <TabsContent
          value="4"
          v-if="uiStore.debugMode"
          class="prose prose-sm dark:prose-invert mx-4 max-w-none"
        >
          <pre>{{ feature }}</pre>
        </TabsContent>
      </ScrollTabs>
    </div>
    <GlobalEvents
      v-if="uiStore.shortcutsEnabled"
      :filter="inputEventFilter"
      @keyup.e="toggleEditMode()"
    />
  </div>
</template>
