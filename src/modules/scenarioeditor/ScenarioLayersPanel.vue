<script setup lang="ts">
import { ImageFilterCenterFocus, MagnifyPlusOutline } from "mdue";
import { GlobalEvents } from "vue-global-events";
import {
  ScenarioFeature,
  ScenarioFeatureProperties,
} from "../../types/scenarioGeoModels";
import TabView from "../../components/TabView.vue";
import TabItem from "../../components/TabItem.vue";
import CloseButton from "../../components/CloseButton.vue";
import DescriptionItem from "../../components/DescriptionItem.vue";
import { computed, defineAsyncComponent, nextTick, ref, watch } from "vue";
import { renderMarkdown } from "../../composables/formatting";
import { featureMenuItems, getGeometryIcon } from "../../composables/scenarioLayers";
import BaseToolbar from "../../components/BaseToolbar.vue";
import ToolbarButton from "../../components/ToolbarButton.vue";
import { ScenarioFeatureActions } from "../../types/constants";
import DotsMenu from "../../components/DotsMenu.vue";
import { useToggle } from "@vueuse/core";
import InputGroup from "../../components/InputGroup.vue";
import BaseButton from "../../components/BaseButton.vue";
import { inputEventFilter } from "../../components/helpers";
import FeatureStrokeSettings from "./FeatureStrokeSettings.vue";
import { type FillStyleSpec, type StrokeStyleSpec } from "../../geo/simplestyle";
import FeatureFillSettings from "./FeatureFillSettings.vue";

const SimpleMarkdownInput = defineAsyncComponent(
  () => import("../../components/SimpleMarkdownInput.vue")
);

const props = defineProps<{ feature: ScenarioFeature }>();
const emit = defineEmits([
  "close",
  "feature-action",
  "feature-meta-update",
  "feature-style-update",
]);

const fillProps = computed(() => {
  const { fill } = props.feature.properties;
  return { fill };
});
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

function onFormMetaSubmit() {
  emit("feature-meta-update", props.feature.id, { ...formMeta.value });
  toggleMetaEdit();
}

const doFormFocus = async () => {
  isMetaEditMode.value = true;
  await nextTick();
  const inputElement = document.getElementById("name-input");
  inputElement && inputElement.focus();
};

function updateStroke(data: Partial<StrokeStyleSpec>) {
  emit("feature-style-update", props.feature.id, { ...data });
}

function updateFill(data: Partial<FillStyleSpec>) {
  emit("feature-style-update", props.feature.id, { ...data });
}
</script>
<template>
  <TabView extra-class="px-6" tab-class="pl-6 pr-6" class="mt-3 min-h-0">
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
                @click="emit('feature-action', feature, ScenarioFeatureActions.Zoom)"
                start
                title="Zoom to"
              >
                <MagnifyPlusOutline class="h-5 w-5" />
              </ToolbarButton>
              <ToolbarButton
                @click="emit('feature-action', feature, ScenarioFeatureActions.Pan)"
                title="Pan to"
              >
                <ImageFilterCenterFocus class="h-5 w-5" />
              </ToolbarButton>
              <ToolbarButton @click="toggleMetaEdit()" :active="isMetaEditMode" end
                ><span class="px-1">Edit</span></ToolbarButton
              >
            </BaseToolbar>
            <div class="relative ml-2">
              <DotsMenu
                :items="featureMenuItems"
                @action="emit('feature-action', feature, $event)"
                class="flex-shrink-0"
              />
            </div>
          </div>
        </header>
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
        <section v-else class="space-y-4">
          <DescriptionItem label="Name">{{ feature.properties.name }}</DescriptionItem>
          <DescriptionItem v-if="feature.properties.description" label="Description">
            <div class="prose prose-sm" v-html="hDescription"></div>
          </DescriptionItem>
        </section>
      </div>
      <div class="-mx-6 mt-4 border-t px-6 py-4">
        <FeatureStrokeSettings :feature="feature" @update="updateStroke" />
      </div>
      <div class="-mx-6 border-t border-b px-6 py-4">
        <FeatureFillSettings :feature="feature" @update="updateFill" />
      </div>
    </TabItem>
    <TabItem label="Debug view">
      <div>
        <pre class="overflow-auto text-sm">{{ feature }}</pre>
      </div>
    </TabItem>
  </TabView>

  <GlobalEvents
    :filter="inputEventFilter"
    @keyup.e="doFormFocus"
    @keyup.z.exact="emit('feature-action', feature, ScenarioFeatureActions.Zoom)"
    @keyup.p="emit('feature-action', feature, ScenarioFeatureActions.Pan)"
  />
</template>
