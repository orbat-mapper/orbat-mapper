<script setup lang="ts">
import AccordionPanel from "../../components/AccordionPanel.vue";
import { ScenarioFeature, ScenarioLayerInstance } from "../../types/scenarioGeoModels";
import {
  Eye as EyeIcon,
  EyeOff,
  FormTextbox,
  MapMarker,
  Pencil as PencilIcon,
  PencilOff,
  VectorCircleVariant,
  VectorLine,
  VectorTriangle,
} from "mdue";
import DotsMenu, { MenuItemData } from "../../components/DotsMenu.vue";
import { ScenarioFeatureActions } from "../../types/constants";
import { ref } from "vue";
import EditLayerInlineForm from "./EditLayerInlineForm.vue";

const props = defineProps<{
  layer: ScenarioLayerInstance;
  isActive: boolean;
}>();
const emit = defineEmits([
  "set-active",
  "feature-action",
  "update-layer",
  "toggle-layer",
]);

const showEditNameForm = ref(props.layer?._isNew || false);

const typeMap: any = {
  Point: MapMarker,
  LineString: VectorLine,
  Polygon: VectorTriangle,
  Circle: VectorCircleVariant,
};

const featureMenuItems: MenuItemData<ScenarioFeatureActions>[] = [
  { label: "Zoom to", action: ScenarioFeatureActions.Zoom },
  { label: "Delete", action: ScenarioFeatureActions.Delete },
];

function getIcon(feature: ScenarioFeature) {
  return typeMap[feature.properties.type];
}
</script>

<template>
  <AccordionPanel :label="layer.name" :default-open="showEditNameForm">
    <template #label>
      <span :class="isActive && 'text-red-900'"> {{ layer.name }} </span
      ><span
        v-if="layer.features.length"
        class="ml-2 inline-flex items-center rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-800"
        >{{ layer.features.length }}</span
      >
    </template>
    <template #right>
      <button
        type="button"
        @click.stop.prevent="emit('set-active', layer)"
        @keydown.stop
        class="hover:text-gray-700"
      >
        <PencilOff v-if="isActive" class="h-5 w-5" />
        <PencilIcon v-else class="h-5 w-5" />
      </button>
      <button
        type="button"
        @click.stop.prevent="showEditNameForm = true"
        @keydown.stop
        class="ml-2 hover:text-gray-700"
      >
        <FormTextbox class="h-5 w-5" />
      </button>
      <button
        type="button"
        @click.stop.prevent="emit('toggle-layer', layer)"
        @keydown.stop
        class="ml-2 mr-2 hover:text-gray-700"
      >
        <EyeOff v-if="layer.isHidden" class="h-5 w-5" />
        <EyeIcon class="h-5 w-5" v-else />
      </button>
    </template>
    <div class="mt-6 flow-root">
      <EditLayerInlineForm
        v-if="showEditNameForm"
        :layer="layer"
        @close="showEditNameForm = false"
        @update="emit('update-layer', layer, $event)"
      />
      <ul class="-mt-5 divide-y divide-gray-200 border-t border-b">
        <li
          v-for="feature in layer.features"
          class="group flex items-center justify-between py-4"
          :key="feature.id"
        >
          <div class="flex items-center">
            <component :is="getIcon(feature)" class="h-5 w-5 text-gray-400" />
            <span class="ml-2 text-sm text-gray-700 group-hover:text-gray-900">
              {{
                feature.properties.name ||
                feature.properties.type ||
                feature.geometry.type
              }}
            </span>
          </div>
          <div class="relative">
            <DotsMenu
              :items="featureMenuItems"
              @action="emit('feature-action', feature, $event, layer)"
              class="flex-shrink-0"
            />
          </div>
        </li>
      </ul>
    </div>
  </AccordionPanel>
</template>
