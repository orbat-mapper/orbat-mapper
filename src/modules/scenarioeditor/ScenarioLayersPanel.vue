<script setup lang="ts">
import { MagnifyPlusOutline } from "mdue";
import {
  ScenarioFeature,
  ScenarioFeatureProperties,
} from "../../types/scenarioGeoModels";
import TabView from "../../components/TabView.vue";
import TabItem from "../../components/TabItem.vue";
import CloseButton from "../../components/CloseButton.vue";
import DescriptionItem from "../../components/DescriptionItem.vue";
import { computed, defineAsyncComponent, ref, watch } from "vue";
import { renderMarkdown } from "../../composables/formatting";
import { featureMenuItems, getGeometryIcon } from "../../composables/scenarioLayers";
import BaseToolbar from "../../components/BaseToolbar.vue";
import ToolbarButton from "../../components/ToolbarButton.vue";
import { ScenarioFeatureActions } from "../../types/constants";
import DotsMenu from "../../components/DotsMenu.vue";
import { useToggle } from "@vueuse/core";
import InputGroup from "../../components/InputGroup.vue";
import PlainButton from "../../components/PlainButton.vue";
import PrimaryButton from "../../components/PrimaryButton.vue";

const SimpleMarkdownInput = defineAsyncComponent(
  () => import("../../components/SimpleMarkdownInput.vue")
);

const props = defineProps<{ feature: ScenarioFeature }>();
const emit = defineEmits(["close", "feature-action", "feature-meta-update"]);

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
  emit("feature-meta-update", props.feature, { ...formMeta.value });
  toggleMetaEdit();
}

const noStroke = ref(false);
const noFill = ref(false);
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
          <div class="flex justify-end space-x-2">
            <PrimaryButton type="submit">Save</PrimaryButton>
            <PlainButton @click="toggleMetaEdit()">Cancel</PlainButton>
          </div>
        </form>
        <section v-else class="space-y-4">
          <DescriptionItem label="Name">{{ feature.properties.name }}</DescriptionItem>
          <DescriptionItem v-if="feature.properties.description" label="Description">
            <div class="prose prose-sm" v-html="hDescription"></div>
          </DescriptionItem>
        </section>
      </div>
      <!--      <div class="-mx-6 mt-4 border-t px-6 py-4">
        <header class="flex items-center justify-between">
          <h4 class="text-sm font-bold text-gray-700">Stroke</h4>
          <ToggleField v-model="noStroke" >None</ToggleField>
        </header>
        <div v-if="!noStroke" class="mt-4">
        <NumberInputGroup v-model="feature.properties['stroke-width']" label="Width"/>
          </div>
      </div>
      <div class="-mx-6 border-t border-b px-6 py-4">
        <header class="flex items-center justify-between">
          <h4 class="text-sm font-bold text-gray-700">Fill</h4>
          <ToggleField v-model="noFill">None</ToggleField>
        </header>
      </div>-->
    </TabItem>
    <TabItem label="Debug view">
      <div>
        <pre class="overflow-auto text-sm">{{ feature }}</pre>
      </div>
    </TabItem>
  </TabView>
</template>
