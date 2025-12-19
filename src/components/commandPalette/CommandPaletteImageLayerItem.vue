<script setup lang="ts">
import { type MapLayerSearchResult } from "@/components/types.ts";
import { getMapLayerIcon } from "@/modules/scenarioeditor/scenarioMapLayers.ts";
import { computed } from "vue";
import { type ScenarioMapLayer } from "@/types/scenarioGeoModels.ts";

const props = defineProps<{ item: MapLayerSearchResult; active?: boolean }>();
const icon = computed(() => getMapLayerIcon(props.item as unknown as ScenarioMapLayer));
</script>

<template>
  <div class="flex w-7 justify-center">
    <component :is="icon" class="text-muted-foreground size-6" />
  </div>
  <p
    class="ml-3 flex-auto truncate"
    v-html="item.highlight ? item.highlight : item.name"
  />
</template>
