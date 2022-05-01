<template>
  <div class="flex w-full items-center justify-between">
    <div class="flex items-center">
      <p class="flex h-10 w-10 flex-shrink-0 items-center">
        <component :is="getItemsIcon(feature.type)" class="h-6 w-6 text-gray-400" />
      </p>
      <p>{{ feature.name }}</p>
      <p class="ml-2 text-xs">{{ feature.score }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LayerFeatureSearchResult } from "./types";
import { getItemsIcon } from "../composables/scenarioLayers";

const props = defineProps<{ feature: LayerFeatureSearchResult }>();
</script>
