<script setup lang="ts">
import { ScenarioFeature, ScenarioLayerInstance } from "../../types/scenarioGeoModels";
import { Eye as EyeIcon, EyeOff, Pencil as PencilIcon, PencilOff } from "mdue";
import DotsMenu, { MenuItemData } from "../../components/DotsMenu.vue";
import { ScenarioLayerActions } from "../../types/constants";
import { ref } from "vue";
import EditLayerInlineForm from "./EditLayerInlineForm.vue";
import ChevronPanel from "../../components/ChevronPanel.vue";
import { featureMenuItems, getGeometryIcon } from "../../composables/scenarioLayers";

const props = defineProps<{
  layer: ScenarioLayerInstance;
  isActive: boolean;
  activeFeature: ScenarioFeature | null | undefined;
}>();

const emit = defineEmits([
  "set-active",
  "feature-action",
  "update-layer",
  "toggle-layer",
  "layer-action",
  "feature-click",
]);

const showEditNameForm = ref(props.layer?._isNew || false);

const layerMenuItems: MenuItemData<ScenarioLayerActions>[] = [
  { label: "Zoom to", action: ScenarioLayerActions.Zoom },
  { label: "Rename", action: ScenarioLayerActions.Rename },
  { label: "Move up", action: ScenarioLayerActions.MoveUp },
  { label: "Move down", action: ScenarioLayerActions.MoveDown },
  { label: "Delete", action: ScenarioLayerActions.Delete },
];

function onLayerAction(action: ScenarioLayerActions) {
  if (action === ScenarioLayerActions.Rename) showEditNameForm.value = true;
  emit("layer-action", props.layer, action);
}
</script>

<template>
  <ChevronPanel
    :label="layer.name"
    :default-open="showEditNameForm"
    :defaultOpen="layer._isOpen"
    @opened="layer._isOpen = true"
    @closed="layer._isOpen = false"
  >
    <template #label>
      <span> {{ layer.name }} </span
      ><span
        v-if="layer.features.length"
        class="ml-2 inline-flex items-center rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-800"
        >{{ layer.features.length }}</span
      >
    </template>
    <template #right>
      <span
        v-if="isActive"
        class="mr-2 inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800"
        >Active</span
      >
      <button
        type="button"
        @click="emit('set-active', layer)"
        @keydown.stop
        class="text-gray-500 hover:text-gray-700"
      >
        <PencilOff v-if="isActive" class="h-5 w-5" />
        <PencilIcon v-else class="h-5 w-5" />
      </button>
      <button
        type="button"
        @click="emit('toggle-layer', layer)"
        @keydown.stop
        class="ml-2 mr-2 text-gray-500 hover:text-gray-700"
      >
        <EyeOff v-if="layer.isHidden" class="h-5 w-5" />
        <EyeIcon class="h-5 w-5" v-else />
      </button>
      <DotsMenu :items="layerMenuItems" @action="onLayerAction" />
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
          <button
            @click="emit('feature-click', feature, layer)"
            class="flex items-center"
          >
            <component :is="getGeometryIcon(feature)" class="h-5 w-5 text-gray-400" />
            <span
              class="ml-2 text-left text-sm text-gray-700 group-hover:text-gray-900"
              :class="{ 'font-bold': activeFeature?.id === feature.id }"
            >
              {{
                feature.properties.name ||
                feature.properties.type ||
                feature.geometry.type
              }}
            </span>
          </button>
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
  </ChevronPanel>
</template>
