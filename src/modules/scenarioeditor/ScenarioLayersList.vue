<script setup lang="ts">
import AccordionPanel from "../../components/AccordionPanel.vue";
import {
  ScenarioFeature,
  ScenarioLayer,
  ScenarioLayerInstance,
} from "../../types/scenarioGeoModels";
import { Eye as EyeIcon, Pencil as PencilIcon, PencilOff } from "mdue";
import { MapMarker, VectorCircleVariant, VectorLine, VectorTriangle } from "mdue";

const props = defineProps<{
  layers: ScenarioLayerInstance[];
  activeLayer: ScenarioLayer | null;
}>();

const typeMap: any = {
  Point: MapMarker,
  LineString: VectorLine,
  Polygon: VectorTriangle,
  Circle: VectorCircleVariant,
};

const emit = defineEmits(["set-active"]);

function getIcon(feature: ScenarioFeature) {
  return typeMap[feature.properties.type];
}
</script>

<template>
  <AccordionPanel v-for="layer in layers" :key="layer.id" :label="layer.name">
    <template #label>
      <span :class="layer === activeLayer && 'text-red-900'"> {{ layer.name }} </span
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
        <PencilOff v-if="layer.id === activeLayer?.id" class="h-5 w-5" />
        <PencilIcon v-else class="h-5 w-5" />
      </button>
      <button type="button" @click.stop.prevent @keydown.stop class="ml-2 mr-2">
        <EyeIcon class="h-5 w-5" />
      </button>
    </template>
    <div class="mt-6 flow-root">
      <ul class="-mt-5 divide-y divide-gray-200 border-t border-b">
        <li v-for="feature in layer.features" class="flex items-center py-4" :key="feature.id">
          <component :is="getIcon(feature)" class="h-5 w-5 text-gray-400" />
          <span class="ml-2 text-sm text-gray-700">
            {{
              feature.properties.name || feature.properties.type || feature.geometry.type
            }}
          </span>
        </li>
      </ul>
    </div>
  </AccordionPanel>
</template>
