<script setup lang="ts">
import { ImageFilterCenterFocus, MagnifyPlusOutline } from "mdue";
import { GlobalEvents } from "vue-global-events";
import {
  ScenarioFeature,
  ScenarioFeatureProperties,
  VisibilityInfo,
} from "@/types/scenarioGeoModels";
import TabView from "@/components/TabView.vue";
import TabItem from "@/components/TabItem.vue";
import CloseButton from "@/components/CloseButton.vue";
import DescriptionItem from "@/components/DescriptionItem.vue";
import { computed, defineAsyncComponent, nextTick, ref, watch } from "vue";
import { renderMarkdown } from "@/composables/formatting";
import {
  featureMenuItems,
  getGeometryIcon,
} from "@/modules/scenarioeditor/scenarioLayers2";
import BaseToolbar from "@/components/BaseToolbar.vue";
import ToolbarButton from "@/components/ToolbarButton.vue";
import DotsMenu from "@/components/DotsMenu.vue";
import { useToggle } from "@vueuse/core";
import InputGroup from "@/components/InputGroup.vue";
import BaseButton from "@/components/BaseButton.vue";
import { inputEventFilter } from "@/components/helpers";
import FeatureStrokeSettings from "./FeatureStrokeSettings.vue";
import {
  type FillStyleSpec,
  MarkerStyleSpec,
  type StrokeStyleSpec,
} from "@/geo/simplestyle";
import FeatureFillSettings from "./FeatureFillSettings.vue";
import FeatureMarkerSettings from "@/modules/scenarioeditor/FeatureMarkerSettings.vue";
import FeatureVisibilitySettings from "@/modules/scenarioeditor/FeatureVisibilitySettings.vue";
import { SelectedScenarioFeatures } from "@/stores/dragStore";

const SimpleMarkdownInput = defineAsyncComponent(
  () => import("@/components/SimpleMarkdownInput.vue")
);

interface Props {
  feature: ScenarioFeature;
  selectedIds: SelectedScenarioFeatures;
}

const props = defineProps<Props>();
const emit = defineEmits([
  "close",
  "feature-action",
  "feature-meta-update",
  "feature-style-update",
]);

const [isMetaEditMode, toggleMetaEdit] = useToggle(false);

const formMeta = ref<Partial<ScenarioFeatureProperties>>({});

watch(
  [isMetaEditMode, () => props.feature],
  ([isEditMode, feature]) => {
    if (!isEditMode) return;
    const { name, description } = props.feature.properties;
    formMeta.value = { name, description };
  },
  { immediate: true }
);

const hDescription = computed(() =>
  renderMarkdown(props.feature.properties.description || "")
);

const geometryType = computed(() => props.feature.properties.type);
const isMultipleFeatures = computed(() => props.selectedIds.size > 1);

function onFormMetaSubmit() {
  emit("feature-meta-update", props.feature.id, { ...formMeta.value });
  toggleMetaEdit();
}

function updateVisibility(data: Partial<VisibilityInfo>) {
  emit(
    "feature-meta-update",
    isMultipleFeatures.value ? [...props.selectedIds.values()] : props.feature.id,
    { ...data }
  );
}

const doFormFocus = async () => {
  isMetaEditMode.value = true;
  await nextTick();
  const inputElement = document.getElementById("name-input");
  inputElement && inputElement.focus();
};

function updateStroke(data: Partial<StrokeStyleSpec>) {
  emit(
    "feature-style-update",
    isMultipleFeatures.value ? [...props.selectedIds.values()] : props.feature.id,
    { ...data }
  );
}

function updateFill(data: Partial<FillStyleSpec>) {
  emit(
    "feature-style-update",
    isMultipleFeatures.value ? [...props.selectedIds.values()] : props.feature.id,
    { ...data }
  );
}

function updateMarker(data: Partial<MarkerStyleSpec>) {
  emit(
    "feature-style-update",
    isMultipleFeatures.value ? [...props.selectedIds.values()] : props.feature.id,
    { ...data }
  );
}
</script>
<template>
  <TabView extra-class="px-6" tab-class="pl-6 pr-6" class="min-h-0">
    <template #extra>
      <div class="flex pt-4">
        <CloseButton @click="emit('close')" />
      </div>
    </template>
    <TabItem label="Feature details">
      <div class="space-y-4">
        <header class="flex items-center justify-between">
          <component :is="getGeometryIcon(feature)" class="h-5 w-5 text-gray-400" />
          <div class="flex items-center">
            <BaseToolbar>
              <ToolbarButton
                @click="
                  emit(
                    'feature-action',
                    isMultipleFeatures ? [...props.selectedIds.values()] : feature.id,
                    'zoom'
                  )
                "
                start
                title="Zoom to"
              >
                <MagnifyPlusOutline class="h-5 w-5" />
              </ToolbarButton>
              <ToolbarButton
                @click="
                  emit(
                    'feature-action',
                    isMultipleFeatures ? [...props.selectedIds.values()] : feature.id,
                    'pan'
                  )
                "
                title="Pan to"
              >
                <ImageFilterCenterFocus class="h-5 w-5" />
              </ToolbarButton>
              <ToolbarButton
                @click="toggleMetaEdit()"
                :active="isMetaEditMode"
                end
                :disabled="isMultipleFeatures"
                ><span class="px-1">Edit</span></ToolbarButton
              >
            </BaseToolbar>
            <div class="relative ml-2">
              <DotsMenu
                :items="featureMenuItems"
                @action="
                  emit(
                    'feature-action',
                    isMultipleFeatures ? [...props.selectedIds.values()] : feature.id,
                    $event
                  )
                "
                class="flex-shrink-0"
              />
            </div>
          </div>
        </header>
        <div v-if="isMultipleFeatures" class="flex items-center justify-between">
          <span class="text-base font-medium text-gray-900"
            >{{ selectedIds.size }} features selected</span
          >
          <button
            class="text-sm text-indigo-600 hover:text-indigo-900"
            @click="selectedIds.clear()"
          >
            Clear selection
          </button>
        </div>
        <form
          v-if="isMetaEditMode"
          @submit.prevent="onFormMetaSubmit()"
          class="mt-0 space-y-4"
        >
          <InputGroup label="Name" v-model="formMeta.name" id="name-input" />
          <SimpleMarkdownInput
            label="Description"
            v-model="formMeta.description"
            description="Use markdown syntax for formatting"
          />

          <div class="flex items-center justify-end space-x-2">
            <BaseButton primary small type="submit">Save</BaseButton>
            <BaseButton small @click="toggleMetaEdit()">Cancel</BaseButton>
          </div>
        </form>
        <section v-else-if="!isMultipleFeatures" class="space-y-4">
          <DescriptionItem label="Name">{{ feature.properties.name }}</DescriptionItem>
          <DescriptionItem v-if="feature.properties.description" label="Description">
            <div class="prose prose-sm" v-html="hDescription"></div>
          </DescriptionItem>
        </section>
      </div>
      <div class="-mx-6 mt-6 divide-y divide-gray-300 border-t border-b border-gray-300">
        <FeatureVisibilitySettings :feature="feature" @update="updateVisibility" />
        <FeatureMarkerSettings
          v-if="geometryType === 'Point'"
          class=""
          :feature="feature"
          @update="updateMarker"
        />
        <FeatureStrokeSettings :feature="feature" @update="updateStroke" />
        <FeatureFillSettings :feature="feature" @update="updateFill" />
      </div>
    </TabItem>
    <TabItem label="Debug view">
      <div>
        <pre class="overflow-auto text-sm">{{ feature }}</pre>
      </div>
    </TabItem>
  </TabView>
  <GlobalEvents :filter="inputEventFilter" @keyup.e="doFormFocus" />
</template>
