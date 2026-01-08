<script setup lang="ts">
import { type LayerFeatureSearchResult } from "@/components/types.ts";
import { getItemsIcon } from "@/modules/scenarioeditor/featureLayerUtils.ts";

const props = defineProps<{ item: LayerFeatureSearchResult }>();
</script>

<template>
  <div class="flex w-7 justify-center">
    <component :is="getItemsIcon(item.type)" class="text-muted-foreground size-6" />
  </div>
  <p
    class="ml-3 flex-auto truncate"
    v-html="item.highlight ? item.highlight : item.name"
  />
</template>
