<script setup lang="ts">
import { computed } from "vue";
import type { NGeometryLayerItem } from "@/types/internalModels";
import PanelDataGrid from "@/components/PanelDataGrid.vue";

const props = defineProps<{ feature: NGeometryLayerItem }>();

function formatTagValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value == null) return "";
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

const tags = computed(() =>
  Object.entries(props.feature.userData ?? {})
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => ({ key, value: formatTagValue(value) })),
);
</script>

<template>
  <PanelDataGrid
    v-if="tags.length"
    class="mt-4 grid-cols-[minmax(6rem,40%)_minmax(0,1fr)]"
  >
    <div class="col-span-2 -mb-2 font-semibold">Tags</div>
    <template v-for="tag in tags" :key="tag.key">
      <div class="text-muted-foreground min-w-0 break-words">{{ tag.key }}</div>
      <div class="min-w-0 break-words">{{ tag.value }}</div>
    </template>
  </PanelDataGrid>
</template>
