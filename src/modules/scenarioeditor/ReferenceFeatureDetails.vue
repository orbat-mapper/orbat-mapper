<script setup lang="ts">
import { computed } from "vue";
import type { ReferenceFeatureSelection } from "@/types/referenceFeature";
import { getReferenceFeatureDisplayValue } from "@/modules/scenarioeditor/referenceFeatureUtils";

interface Props {
  feature: ReferenceFeatureSelection;
}

const { feature } = defineProps<Props>();

const propertyEntries = computed(() =>
  Object.entries(feature.properties)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => ({
      key,
      ...getReferenceFeatureDisplayValue(value),
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
        <div
          v-if="entry.kind === 'html'"
          class="reference-feature-html prose prose-sm dark:prose-invert max-w-none overflow-x-auto break-words"
          v-html="entry.value"
        />
        <pre v-else class="font-sans text-sm break-words whitespace-pre-wrap">{{
          entry.value
        }}</pre>
      </div>
    </div>

    <p v-else class="text-muted-foreground text-sm">
      No properties attached to this KML feature.
    </p>
  </section>
</template>

<style scoped>
.reference-feature-html :deep(table) {
  width: 100%;
}

.reference-feature-html :deep(th),
.reference-feature-html :deep(td) {
  vertical-align: top;
}

:global(.dark)
  .reference-feature-html
  :deep(
    p,
    div,
    span,
    li,
    dt,
    dd,
    blockquote,
    pre,
    code,
    th,
    td,
    h1,
    h2,
    h3,
    h4,
    h5,
    h6,
    strong,
    em,
    b,
    i,
    u,
    small,
    sub,
    sup,
    font
  ) {
  color: var(--foreground) !important;
}

:global(.dark) .reference-feature-html :deep(table),
:global(.dark) .reference-feature-html :deep(thead),
:global(.dark) .reference-feature-html :deep(tbody),
:global(.dark) .reference-feature-html :deep(tfoot),
:global(.dark) .reference-feature-html :deep(tr),
:global(.dark) .reference-feature-html :deep(th),
:global(.dark) .reference-feature-html :deep(td) {
  background-color: transparent !important;
  border-color: var(--border) !important;
}

:global(.dark) .reference-feature-html :deep(a) {
  color: var(--primary) !important;
}

:global(.dark) .reference-feature-html :deep(hr) {
  border-color: var(--border) !important;
}

:global(.dark) .reference-feature-html :deep(img) {
  opacity: 0.95;
}
</style>
