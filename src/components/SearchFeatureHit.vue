<script setup lang="ts">
import { type LayerFeatureSearchResult } from "./types";
import { getItemsIcon } from "@/modules/scenarioeditor/featureLayerUtils";

const props = defineProps<{ feature: LayerFeatureSearchResult }>();
</script>

<template>
  <div class="flex w-full items-center justify-between">
    <div class="flex items-center">
      <p class="flex h-10 w-10 shrink-0 items-center">
        <component
          :is="getItemsIcon(feature.type)"
          class="text-muted-foreground h-6 w-6"
        />
      </p>
      <p v-if="feature.highlight" v-html="feature.highlight" />
      <p v-else>{{ feature.name }}</p>
    </div>
  </div>
</template>
