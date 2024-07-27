<script setup lang="ts">
import { computed } from "vue";
import { IconClockOutline } from "@iconify-prerendered/vue-mdi";
import DotsMenu from "@/components/DotsMenu.vue";
import { ScenarioFeature } from "@/types/scenarioGeoModels";
import {
  featureMenuItems,
  getGeometryIcon,
} from "@/modules/scenarioeditor/scenarioLayers2";
import { ScenarioFeatureActions } from "@/types/constants";

interface Props {
  feature: ScenarioFeature;
  layer: any;
  selected?: boolean;
  active?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "feature-click", data: MouseEvent): void;
  (e: "feature-double-click", data: MouseEvent): void;
  (e: "feature-action", data: ScenarioFeatureActions): void;
}>();
const hidden = computed(() => props.layer.isHidden);
</script>

<template>
  <li
    class="group flex items-center justify-between border-l pl-1 hover:bg-amber-50"
    :key="feature.id"
    :class="selected ? 'border-yellow-500 bg-yellow-100' : 'border-transparent'"
  >
    <button
      @click="emit('feature-click', $event)"
      @dblclick="emit('feature-double-click', $event)"
      class="flex flex-auto items-center py-2.5 sm:py-2"
    >
      <component :is="getGeometryIcon(feature)" class="h-5 w-5 text-gray-400" />
      <span
        class="ml-2 text-left text-sm text-gray-700 group-hover:text-gray-900"
        :class="{ 'font-bold': active, 'opacity-50': hidden }"
      >
        {{ feature.meta.name || feature.type || feature.geometry.type }}
      </span>
    </button>
    <div class="relative flex items-center">
      <IconClockOutline
        v-if="feature.meta.visibleFromT || feature.meta.visibleUntilT"
        class="h-5 w-5 text-gray-400"
      />
      <DotsMenu
        :items="featureMenuItems"
        @action="emit('feature-action', $event)"
        class="opacity-0 group-focus-within:opacity-100 group-hover:opacity-100"
      />
    </div>
  </li>
</template>
