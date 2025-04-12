<script setup lang="ts">
import {
  IconImage as ImageIcon,
  IconMagnifyExpand as ZoomIcon,
  IconPalette as StyleIcon,
  IconPencil as EditIcon,
} from "@iconify-prerendered/vue-mdi";
import { GlobalEvents } from "vue-global-events";

import { injectStrict } from "@/utils";
import {
  activeFeatureSelectInteractionKey,
  activeMapKey,
  activeScenarioKey,
} from "@/components/injects";
import { computed, defineAsyncComponent, ref, watch } from "vue";
import { getGeometryIcon } from "@/modules/scenarioeditor/featureLayerUtils";
import { type ScenarioFeatureMeta } from "@/types/scenarioGeoModels";
import { useDebounceFn } from "@vueuse/core";
import ScenarioFeatureMarkerSettings from "@/modules/scenarioeditor/ScenarioFeatureMarkerSettings.vue";
import ScenarioFeatureStrokeSettings from "@/modules/scenarioeditor/ScenarioFeatureStrokeSettings.vue";
import ScenarioFeatureFillSettings from "@/modules/scenarioeditor/ScenarioFeatureFillSettings.vue";
import EditableLabel from "@/components/EditableLabel.vue";
import { type SelectedScenarioFeatures, useSelectedItems } from "@/stores/selectedStore";
import IconButton from "@/components/IconButton.vue";
import { TabPanel } from "@headlessui/vue";
import TabWrapper from "@/components/TabWrapper.vue";
import { useUiStore } from "@/stores/uiStore";
import { useTabStore } from "@/stores/tabStore";
import { useMainToolbarStore } from "@/stores/mainToolbarStore";
import { storeToRefs } from "pinia";
import { useScenarioFeatureActions } from "@/composables/scenarioActions";
import { renderMarkdown } from "@/composables/formatting";
import EditMetaForm from "@/modules/scenarioeditor/EditMetaForm.vue";
import EditMediaForm from "@/modules/scenarioeditor/EditMediaForm.vue";
import type { MediaUpdate, ScenarioFeatureUpdate } from "@/types/internalModels";
import ItemMedia from "@/modules/scenarioeditor/ItemMedia.vue";
import { inputEventFilter } from "@/components/helpers";
import ScenarioFeatureDropdownMenu from "@/modules/scenarioeditor/ScenarioFeatureDropdownMenu.vue";
import type { ScenarioFeatureActions } from "@/types/constants";
import ScenarioFeatureState from "@/modules/scenarioeditor/ScenarioFeatureState.vue";
import ScenarioFeatureTextSettings from "@/modules/scenarioeditor/ScenarioFeatureTextSettings.vue";
import ScenarioFeatureVisibilitySettings from "@/modules/scenarioeditor/ScenarioFeatureVisibilitySettings.vue";
import PanelDataGrid from "@/components/PanelDataGrid.vue";

interface Props {
  selectedIds: SelectedScenarioFeatures;
}

const props = defineProps<Props>();

const FeatureTransformations = defineAsyncComponent(
  () => import("@/modules/scenarioeditor/FeatureTransformations.vue"),
);

const {
  geo,
  store: { groupUpdate },
} = injectStrict(activeScenarioKey);
const olMapRef = injectStrict(activeMapKey);
const featureSelectInteractionRef = injectStrict(activeFeatureSelectInteractionKey);

const featureActions = useScenarioFeatureActions();
const { selectedFeatureIds, clear: clearSelection } = useSelectedItems();
const uiStore = useUiStore();
const { featureDetailsTab: selectedTab } = storeToRefs(useTabStore());
const toolbarStore = useMainToolbarStore();

const feature = computed(() => {
  if (props.selectedIds.size === 1) {
    return geo.getFeatureById(props.selectedIds.values().next().value!).feature;
  }
  return null;
});

const featureName = ref("DD");
const featureDescription = ref();
const hDescription = computed(() =>
  renderMarkdown(feature.value?.meta.description || ""),
);

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
  () => feature.value?.meta.name,
  (v) => {
    featureName.value = v ?? "";
    featureDescription.value = feature.value?.meta.description ?? "";
  },
  { immediate: true },
);

const geometryType = computed(() => feature.value?.meta.type);
const hasStroke = computed(() => geometryType.value !== "Point");
const hasFill = computed(
  () => !["Point", "LineString"].includes(geometryType.value || ""),
);

const isMultiMode = computed(() => selectedFeatureIds.value.size > 1);

const tabList = computed(() =>
  uiStore.debugMode
    ? ["Style", "Details", "State", "Transform", "Debug"]
    : ["Style", "Details", "State", "Transform"],
);

const isEditing = computed(() => isEditMode.value || isEditMediaMode.value);
const media = computed(() => {
  const { media = [] } = feature.value || {};
  return media.length ? media[0] : null;
});

function updateValue(value: string) {
  feature.value && geo.updateFeature(feature.value?.id, { meta: { name: value } });
}

const debouncedResetMap = useDebounceFn(
  () => featureSelectInteractionRef.value.setMap(olMapRef.value),
  3000,
);

function doUpdateFeature(data: ScenarioFeatureUpdate) {
  const featureOrFeatures = isMultiMode.value
    ? [...props.selectedIds.values()]
    : feature.value?.id;
  featureSelectInteractionRef.value.setMap(null);
  if (Array.isArray(featureOrFeatures)) {
    groupUpdate(() => featureOrFeatures.forEach((f) => geo.updateFeature(f, data)), {
      label: "batchLayer",
      value: "nil",
    });
  } else {
    featureOrFeatures && geo.updateFeature(featureOrFeatures, data);
  }
  if (feature.value) {
    toolbarStore.currentDrawStyle = { ...feature.value.style };
  }
  debouncedResetMap();
}

function doMetaUpdate(data: Partial<ScenarioFeatureMeta>) {
  if (data) doUpdateFeature({ meta: data });
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
  featureActions.onFeatureAction([...props.selectedIds], action);
}
</script>
<template>
  <div>
    <ItemMedia v-if="media" :media="media" />
    <header class="">
      <div v-if="isMultiMode" class="mt-6 mb-2 flex items-center justify-between">
        <p class="font-medium">{{ selectedFeatureIds.size }} features selected</p>
        <button @click="clearSelection()" class="text-indigo-600 hover:text-indigo-900">
          Clear
        </button>
      </div>
      <div v-if="feature" class="">
        <EditableLabel v-model="featureName" @update-value="updateValue" />
      </div>

      <nav class="flex items-center justify-between">
        <div class="flex items-center">
          <component :is="getGeometryIcon(feature!)" class="mr-2 h-6 w-6 text-red-900" />
          <IconButton @click="doZoom()" title="Zoom to feature">
            <ZoomIcon class="h-6 w-6" />
          </IconButton>
          <IconButton @click="showStylePanel()" title="Change feature style">
            <StyleIcon class="h-6 w-6" />
          </IconButton>
          <IconButton title="Edit feature data" @click="toggleEditMode()">
            <EditIcon class="h-6 w-6" />
          </IconButton>
          <IconButton title="Add/modify image" @click="toggleEditMediaMode()">
            <ImageIcon class="h-6 w-6" />
          </IconButton>
        </div>
        <div>
          <ScenarioFeatureDropdownMenu @action="onAction" />
        </div>
      </nav>
    </header>
    <TabWrapper :tab-list="tabList" v-model="selectedTab">
      <TabPanel>
        <PanelDataGrid class="mt-4">
          <ScenarioFeatureVisibilitySettings
            v-if="feature"
            :feature="feature"
            @update="doUpdateFeature"
          />
          <ScenarioFeatureMarkerSettings
            v-if="feature && geometryType === 'Point'"
            :feature="feature"
            @update="doUpdateFeature"
          />
          <ScenarioFeatureStrokeSettings
            v-if="feature && hasStroke"
            :feature="feature"
            @update="doUpdateFeature"
          />
          <ScenarioFeatureFillSettings
            v-if="feature && hasFill"
            :feature="feature"
            @update="doUpdateFeature"
          />
          <ScenarioFeatureTextSettings
            v-if="feature && geometryType !== 'Circle'"
            :feature="feature"
            @update="doUpdateFeature"
          />
        </PanelDataGrid>
      </TabPanel>
      <TabPanel>
        <div v-if="!isEditing" class="prose mt-4">
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
      </TabPanel>
      <TabPanel><ScenarioFeatureState v-if="feature" :feature="feature" /></TabPanel>
      <TabPanel>
        <FeatureTransformations :feature="feature!" class="mt-4" />
      </TabPanel>
      <TabPanel v-if="uiStore.debugMode" class="prose prose-sm max-w-none">
        <pre>{{ feature }}</pre>
      </TabPanel>
    </TabWrapper>
    <GlobalEvents
      v-if="uiStore.shortcutsEnabled"
      :filter="inputEventFilter"
      @keyup.e="toggleEditMode()"
    />
  </div>
</template>
