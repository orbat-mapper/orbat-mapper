<script setup lang="ts">
import AccordionPanel from "../../components/AccordionPanel.vue";
import { ScenarioLayer } from "../../types/scenarioGeoModels";
import { Eye as EyeIcon, Pencil as PencilIcon, PencilOff } from "mdue";

const props = defineProps<{
  layers: ScenarioLayer[];
  activeLayer: ScenarioLayer | null;
}>();
const emit = defineEmits(["set-active"]);
</script>

<template>
  <AccordionPanel v-for="layer in layers" :key="layer.id" :label="layer.name">
    <template #label>
      <span :class="layer === activeLayer && 'text-red-900'">
        {{ layer.name }}
      </span>
    </template>
    <template #right>
      <button
        type="button"
        @click.stop.prevent="emit('set-active', layer)"
        @keydown.stop
        class="hover:text-gray-700"
      >
        <PencilOff v-if="layer === activeLayer" class="h-5 w-5" />
        <PencilIcon v-else class="h-5 w-5" />
      </button>
      <button type="button" @click.stop.prevent @keydown.stop class="ml-2 mr-2">
        <EyeIcon class="h-5 w-5" />
      </button>
    </template>
    <ul>
      <li v-for="feature in layer.features">
        {{ feature.properties.name }}{{ feature.geometry.type }}
      </li>
    </ul>
  </AccordionPanel>
</template>
