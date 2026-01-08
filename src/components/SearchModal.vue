<script setup lang="ts">
import { computed, ref } from "vue";
import { GlobalEvents } from "vue-global-events";
import SimpleModal from "./SimpleModal.vue";
import { useDebounce, useVModel } from "@vueuse/core";
import SearchModalInput from "./SearchModalInput.vue";
import SearchUnitHit from "./SearchUnitHit.vue";
import ToggleField from "./ToggleField.vue";
import type { LayerFeatureSearchResult, UnitSearchResult } from "./types";
import { groupBy, htmlTagEscape, injectStrict } from "../utils";
import SearchFeatureHit from "./SearchFeatureHit.vue";
import * as fuzzysort from "fuzzysort";
import { activeScenarioKey } from "@/components/injects";
import { type NUnit } from "@/types/internalModels";

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits([
  "update:modelValue",
  "select-unit",
  "select-layer",
  "select-feature",
]);

const {
  unitActions,
  geo,
  helpers: { getUnitById },
} = injectStrict(activeScenarioKey);

const open = useVModel(props, "modelValue");
const query = ref("");
const debouncedQuery = useDebounce(query, 200);
const currentHitIndex = ref(0);
const limitToPosition = ref(false);

const unitHits = computed(() => {
  const q = debouncedQuery.value.trim();
  if (!q) return [];
  const hits = fuzzysort.go(q, unitActions.units.value, { keys: ["name", "shortName"] });
  currentHitIndex.value = 0;
  return hits
    .filter((h) => {
      if (limitToPosition.value) return getUnitById(h.obj.id)?._state?.location;
      return true;
    })
    .slice(0, 10)
    .map((u, i) => {
      const parent = u.obj._pid && ({ ...getUnitById(u.obj._pid) } as NUnit);
      if (parent) {
        parent.symbolOptions = unitActions.getCombinedSymbolOptions(parent);
      }
      return {
        name: u.obj.name,
        sidc: u.obj.sidc,
        id: u.obj.id,
        parent,
        highlight:
          u[0] &&
          fuzzysort.highlight({
            ...u[0],
            score: u.score,
            target: htmlTagEscape(u[0].target),
          }),
        score: u.score,
        category: "Units",
        symbolOptions: unitActions.getCombinedSymbolOptions(u.obj),
      };
    });
});

const featureHits = computed(() => {
  const q = debouncedQuery.value.trim();
  if (!q) return [];

  const hits = fuzzysort.go(q, geo.itemsInfo.value, { key: ["name"] });

  currentHitIndex.value = 0;
  return hits.slice(0, 10).map((u, i) => ({
    ...u.obj,
    highlight: fuzzysort.highlight({
      ...u,
      target: htmlTagEscape(u.target),
    }),
    score: u.score,
    category: "Features",
  }));
});

const hits = computed(() => {
  const combinedHits = [unitHits.value, featureHits.value].sort((a, b) => {
    const scoreA = a[0]?.score ?? 1000;
    const scoreB = b[0]?.score ?? 1000;
    return scoreB - scoreA;
  });
  return [...combinedHits.flat()].map((e, index) => ({
    ...e,
    index,
  })) as (UnitSearchResult | LayerFeatureSearchResult)[];
});

const groupedHits = computed(() => {
  return groupBy(hits.value, "category");
});

function doKbd(direction: "up" | "down") {
  const nHits = hits.value.length;
  if (direction === "up") {
    if (currentHitIndex.value === 0) {
      currentHitIndex.value = nHits - 1;
    } else currentHitIndex.value = currentHitIndex.value - 1;
  } else if (direction === "down") {
    currentHitIndex.value++;
    if (currentHitIndex.value >= nHits) {
      currentHitIndex.value = 0;
    }
  }
}

function onSelect(index?: number) {
  const i = index === undefined ? currentHitIndex.value : index;
  if (!hits.value.length) return;
  const item = hits.value[i];
  if (item.category === "Units") emit("select-unit", item.id);
  if (item.category === "Features") {
    if (item.type === "layer") emit("select-layer", item.id);
    else emit("select-feature", item.id, item._pid);
  }

  open.value = false;
}
</script>

<template>
  <SimpleModal v-model="open">
    <SearchModalInput v-model="query" />
    <ToggleField class="my-4" v-model="limitToPosition"
      >Show only units with a position
    </ToggleField>
    <main class="space-y-4">
      <section v-for="[source, hits] in groupedHits">
        <p class="text-muted-foreground font-medium">{{ source }}</p>
        <ul class="space-y-1.5">
          <li v-for="hit in hits">
            <button
              type="button"
              class="hover:border-army flex w-full items-center rounded border border-transparent p-2 hover:border hover:bg-red-100 focus:ring-3"
              :class="hit.index === currentHitIndex ? 'bg-blue-200' : 'bg-gray-100'"
              @click="onSelect(hit.index)"
            >
              <SearchUnitHit v-if="hit.category === 'Units'" :unit="hit" />
              <SearchFeatureHit v-else-if="hit.category === 'Features'" :feature="hit" />
            </button>
          </li>
        </ul>
      </section>
    </main>
    <GlobalEvents
      v-if="open"
      @keydown.arrow-down="doKbd('down')"
      @keydown.arrow-up="doKbd('up')"
      @keydown.enter.prevent="onSelect()"
    >
    </GlobalEvents>
  </SimpleModal>
</template>
