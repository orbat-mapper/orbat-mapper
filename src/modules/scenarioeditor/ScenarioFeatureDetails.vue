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
  readonlyKey,
} from "@/components/injects";
import { computed, defineAsyncComponent, inject, ref, watch } from "vue";
import { getGeometryIcon } from "@/modules/scenarioeditor/featureLayerUtils";
import { type ScenarioFeatureMeta } from "@/types/scenarioGeoModels";
import { useDebounceFn } from "@vueuse/core";
import ScenarioFeatureMarkerSettings from "@/modules/scenarioeditor/ScenarioFeatureMarkerSettings.vue";
import ScenarioFeatureStrokeSettings from "@/modules/scenarioeditor/ScenarioFeatureStrokeSettings.vue";
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
import type { MediaUpdate, ScenarioFeatureUpdate } from "@/types/internalModels";
import ItemMedia from "@/modules/scenarioeditor/ItemMedia.vue";
import { inputEventFilter } from "@/components/helpers";
import ScenarioFeatureDropdownMenu from "@/modules/scenarioeditor/ScenarioFeatureDropdownMenu.vue";
import type { ScenarioFeatureActions } from "@/types/constants";
import ScenarioFeatureState from "@/modules/scenarioeditor/ScenarioFeatureState.vue";
import ScenarioFeatureTextSettings from "@/modules/scenarioeditor/ScenarioFeatureTextSettings.vue";
import ScenarioFeatureVisibilitySettings from "@/modules/scenarioeditor/ScenarioFeatureVisibilitySettings.vue";
import PanelDataGrid from "@/components/PanelDataGrid.vue";
import { Button } from "@/components/ui/button";

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
const isReadonly = inject(readonlyKey, ref(false));

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

const tabList = computed(() => {
  const base = [
    { label: "Details", value: "1" },
    { label: "State", value: "2" },
  ];

  if (!isReadonly.value) {
    base.unshift({ label: "Style", value: "0" });
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
        <Button variant="outline" type="button" size="sm" @click="clearSelection()">
          Clear
        </Button>
      </div>
      <div v-if="feature" class="">
        <EditableLabel
          v-model="featureName"
          @update-value="updateValue"
          :disabled="isReadonly"
        />
      </div>

      <nav class="flex items-center justify-between">
        <div class="flex items-center">
          <component
            :is="getGeometryIcon(feature!)"
            class="text-muted-foreground mr-2 size-6"
          />
          <IconButton @click="doZoom()" title="Zoom to feature">
            <ZoomIcon class="size-5" />
          </IconButton>
          <template v-if="!isReadonly">
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
        </div>
        <div v-if="!isReadonly">
          <ScenarioFeatureDropdownMenu @action="onAction" />
        </div>
      </nav>
    </header>
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
        </TabsContent>
        <TabsContent value="1" class="mx-4">
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
        </TabsContent>
        <TabsContent value="2" class="mx-4"
          ><ScenarioFeatureState v-if="feature" :feature="feature"
        /></TabsContent>
        <TabsContent value="3" class="mx-4">
          <FeatureTransformations class="mt-4" />
        </TabsContent>
        <TabsContent
          value="4"
          v-if="uiStore.debugMode"
          class="prose prose-sm mx-4 max-w-none"
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
