<script setup lang="ts">
import { computed } from "vue";
import type { ReferenceFeatureSelection } from "@/types/referenceFeature";
import { formatReferenceFeatureValue } from "@/modules/scenarioeditor/referenceFeatureUtils";

interface Props {
  feature: ReferenceFeatureSelection;
}

const { feature } = defineProps<Props>();

const propertyEntries = computed(() =>
  Object.entries(feature.properties)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => ({
      key,
      value: formatReferenceFeatureValue(value),
    })),
);
</script>

<template>
  <section class="space-y-4">
    <header class="space-y-1">
      <p class="text-muted-foreground text-sm">{{ feature.layerName }}</p>
      <h2 class="text-lg font-semibold">{{ feature.name || "KML feature" }}</h2>
      <p v-if="feature.featureId !== undefined" class="text-muted-foreground text-xs">
        ID: <span class="font-mono">{{ feature.featureId }}</span>
      </p>
    </header>

    <div v-if="propertyEntries.length" class="space-y-3">
      <div
        v-for="entry in propertyEntries"
        :key="entry.key"
        class="border-border space-y-1 border-b pb-3 last:border-b-0"
      >
        <p class="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          {{ entry.key }}
        </p>
        <pre class="font-sans text-sm break-words whitespace-pre-wrap">{{
          entry.value
        }}</pre>
      </div>
    </div>

    <p v-else class="text-muted-foreground text-sm">
      No properties attached to this KML feature.
    </p>
  </section>
</template>
