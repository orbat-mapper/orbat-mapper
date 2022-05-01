<template>
  <SimpleModal v-model="open">
    <SearchModalInput v-model="query" />
    <ToggleField class="my-4" v-model="limitToPosition"
      >Show only units with a position
    </ToggleField>
    <main class="space-y-4">
      <section v-for="[source, hits] in groupedHits">
        <p class="font-medium text-gray-700">{{ source }}</p>
        <ul>
          <li v-for="hit in hits">
            <button
              type="button"
              class="flex w-full items-center rounded border border-transparent p-2 hover:border hover:border-army hover:bg-red-100 focus:ring"
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

<script setup lang="ts">
import { computed, ref } from "vue";
import Fuse from "fuse.js";
import { GlobalEvents } from "vue-global-events";
import SimpleModal from "./SimpleModal.vue";
import { useDebounce, useVModel } from "@vueuse/core";
import SearchModalInput from "./SearchModalInput.vue";
import SearchUnitHit from "./SearchUnitHit.vue";
import { useScenarioStore } from "../stores/scenarioStore";
import ToggleField from "./ToggleField.vue";
import { useScenarioLayersStore } from "../stores/scenarioLayersStore";
import { LayerFeatureSearchResult, SearchResult, UnitSearchResult } from "./types";
import { groupBy } from "../utils";
import SearchFeatureHit from "./SearchFeatureHit.vue";

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits(["update:modelValue", "select-unit"]);
const open = useVModel(props, "modelValue");
const query = ref("");
const debouncedQuery = useDebounce(query, 200);
const scenarioStore = useScenarioStore();
const layerStore = useScenarioLayersStore();
const currentHitIndex = ref(0);
const limitToPosition = ref(false);

const maxScore = 0.5;
const unitFuseRef = computed(
  () =>
    new Fuse(scenarioStore.units, {
      keys: ["name", "shortName"],
      useExtendedSearch: false,
      includeScore: true,
      // ignoreLocation: true
    })
);

const featureFuseRef = computed(() => {
  return new Fuse(layerStore.itemsInfo, {
    keys: ["name"],
    useExtendedSearch: false,
    includeScore: true,
    ignoreLocation: true,
  });
});

const unitHits = computed(() => {
  const q = debouncedQuery.value.trim();
  if (!q) return [];

  const hits = unitFuseRef.value
    .search(q)
    .map((i) => ({ ...i.item, score: i.score ?? 1 }));
  currentHitIndex.value = 0;
  return hits
    .filter((h) => {
      if (h.score > maxScore) return false;
      if (limitToPosition.value) return scenarioStore.getUnitById(h.id)?._state?.location;
      return true;
    })
    .slice(0, 10)
    .map((u) => ({
      name: u.name,
      sidc: u.sidc,
      id: u.id,
      parent: u._pid && scenarioStore.getUnitById(u._pid),
      score: u.score,
      category: "Units",
    }));
});

const featureHits = computed(() => {
  const q = debouncedQuery.value.trim();
  if (!q) return [];

  const hits = featureFuseRef.value
    .search(q)
    .map((i) => ({ ...i.item, score: i.score ?? 1, category: "Features" }));

  currentHitIndex.value = 0;
  return hits
    .filter((h) => {
      return h.score <= maxScore;
    })
    .slice(0, 10);
});

const hits = computed(() => {
  return [...unitHits.value, ...featureHits.value].map((e, index) => ({
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
  else {
    console.log("Feature selected", item);
  }
  open.value = false;
}
</script>
