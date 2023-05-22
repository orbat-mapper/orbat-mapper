<template>
  <TransitionRoot :show="open" as="template" @after-leave="" appear>
    <Dialog as="div" class="relative z-10" @close="open = false">
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-gray-500 bg-opacity-25 transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 z-10 overflow-y-auto p-4 sm:p-6 md:p-20">
        <TransitionChild
          as="template"
          enter="ease-out duration-300"
          enter-from="opacity-0 scale-95"
          enter-to="opacity-100 scale-100"
          leave="ease-in duration-200"
          leave-from="opacity-100 scale-100"
          leave-to="opacity-0 scale-95"
        >
          <DialogPanel
            class="mx-auto max-w-xl transform divide-y divide-gray-100 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 transition-all"
            :class="isGeoSearch && 'bg-red-500'"
          >
            <Combobox @update:modelValue="onSelect">
              <div class="relative">
                <MagnifyingGlassIcon
                  class="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
                <ComboboxInput
                  class="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                  placeholder="Search..."
                  @change="rawQuery = $event.target.value"
                />
              </div>

              <ComboboxOptions
                v-if="groupedHits && hitCount > 0"
                static
                class="max-h-80 scroll-py-10 scroll-pb-2 space-y-4 overflow-y-auto p-4 pb-2"
              >
                <li v-for="[source, hits] in groupedHits">
                  <h2 class="text-xs font-semibold text-gray-900">{{ source }}</h2>
                  <ul class="-mx-4 mt-2 text-sm font-medium text-gray-700">
                    <ComboboxOption
                      v-for="item in hits"
                      :key="item.id"
                      :value="item"
                      as="template"
                      v-slot="{ active }"
                    >
                      <CommandPaletteUnitItem
                        v-if="item.category === 'Units'"
                        :item="item"
                        :active="active"
                        class=""
                      />
                      <CommandPaletteLayerFeatureItem
                        v-else-if="item.category === 'Features'"
                        :active="active"
                        :item="item"
                      />
                      <CommandPaletteEventItem
                        v-else-if="item.category === 'Events'"
                        :active="active"
                        :item="item"
                      />
                      <CommandPalettePlaceItem
                        :item="item"
                        v-else-if="item.category === 'Places'"
                        :active="active"
                        :center="mapCenter"
                      />
                      <CommandPaletteActionItem
                        v-else-if="item.category === 'Actions'"
                        :active="active"
                        :item="item"
                      />
                      <p v-else>{{ item }}</p>
                    </ComboboxOption>
                  </ul>
                </li>
              </ComboboxOptions>

              <CommandPaletteHelp v-if="showHelp" />

              <div
                v-if="geoDebouncedQuery !== '' && rawQuery !== '?' && hitCount === 0"
                class="px-6 py-14 text-center text-sm sm:px-14"
              >
                <ExclamationTriangleIcon
                  class="mx-auto h-6 w-6 text-gray-400"
                  aria-hidden="true"
                />
                <p class="mt-4 font-semibold text-gray-900">No results found</p>
              </div>
              <CommandPaletteFooter
                :raw-query="rawQuery"
                @click-actions="rawQuery = '>'"
              />
            </Combobox>
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { computed, ref, watch, watchEffect } from "vue";
import { MagnifyingGlassIcon } from "@heroicons/vue/20/solid";
import { ExclamationTriangleIcon } from "@heroicons/vue/24/outline";
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Dialog,
  DialogPanel,
  TransitionChild,
  TransitionRoot,
} from "@headlessui/vue";
import CommandPaletteFooter from "@/components/CommandPaletteFooter.vue";
import CommandPaletteHelp from "@/components/CommandPaletteHelp.vue";
import { useDebounce, useVModel } from "@vueuse/core";
import { useActionSearch, useScenarioSearch } from "@/composables/searching";
import CommandPaletteUnitItem from "@/components/CommandPaletteUnitItem.vue";
import CommandPaletteLayerFeatureItem from "@/components/CommandPaletteLayerFeatureItem.vue";
import {
  ActionSearchResult,
  EventSearchResult,
  LayerFeatureSearchResult,
  SearchResult,
  UnitSearchResult,
} from "@/components/types";
import CommandPaletteEventItem from "@/components/CommandPaletteEventItem.vue";
import { useGeoStore } from "@/stores/geoStore";
import { toLonLat } from "ol/proj";
import { PhotonSearchResult, useGeoSearch } from "@/composables/geosearching";
import CommandPalettePlaceItem from "@/components/CommandPalettePlaceItem.vue";
import { useUiStore } from "@/stores/uiStore";
import CommandPaletteActionItem from "@/components/CommandPaletteActionItem.vue";

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits([
  "update:modelValue",
  "select-unit",
  "select-layer",
  "select-feature",
  "select-place",
  "select-event",
  "select-action",
]);

const geoStore = useGeoStore();
const uiStore = useUiStore();
const { photonSearch } = useGeoSearch();
const { searchActions, actionItems } = useActionSearch();
const open = useVModel(props, "modelValue", emit);

const rawQuery = ref("");
const query = computed(() => rawQuery.value.replace(/^[#@]/, ""));
const showHelp = computed(() => rawQuery.value === "?");
const isGeoSearch = computed(
  () => uiStore.searchGeoMode || rawQuery.value.startsWith("@")
);

const isActionSearch = computed(() => rawQuery.value.startsWith("#"));

const debouncedQuery = useDebounce(query, 200);
const geoDebouncedQuery = useDebounce(query, 500);
const { search } = useScenarioSearch();

interface ExtendedPhotonSearchResult extends PhotonSearchResult {
  category: "Places";
}

const groupedHits = ref<
  | ReturnType<typeof search>["groups"]
  | Map<"Places", ExtendedPhotonSearchResult[]>
  | Map<"Actions", ActionSearchResult[]>
>();
const mapCenter = ref<number[] | null | undefined>();

const hitCount = ref(0);

watch(open, (isOpen) => {
  if (isOpen) {
    if (geoStore.olMap) {
      const center = geoStore.olMap.getView().getCenter();
      mapCenter.value = center && toLonLat(center);
    } else {
      mapCenter.value = null;
    }
  }
});

watchEffect(() => {
  if (isGeoSearch.value || isActionSearch.value || !debouncedQuery.value.trim()) return;
  const { numberOfHits, groups } = search(debouncedQuery.value);
  hitCount.value = numberOfHits;
  groupedHits.value = groups;
});

watch(
  () => isGeoSearch.value && geoDebouncedQuery.value.trim(),
  async (q) => {
    if (!q) return;
    const data = await photonSearch(q, { mapCenter: mapCenter.value });
    groupedHits.value = new Map([
      ["Places", data.map((d) => ({ ...d, category: "Places" }))],
    ]);
    hitCount.value = data.length;
  }
);

watch([() => isActionSearch.value, () => query.value.trim()], async ([isa, q]) => {
  if (!isa) return;
  const filteredActions = q ? searchActions(q) : actionItems;
  groupedHits.value = new Map([["Actions", filteredActions]]);
  hitCount.value = filteredActions.length;
});

function onSelect(
  item:
    | UnitSearchResult
    | LayerFeatureSearchResult
    | EventSearchResult
    | ExtendedPhotonSearchResult
    | ActionSearchResult
) {
  if (item.category === "Units") emit("select-unit", item.id);
  else if (item.category === "Features") {
    if (item.type === "layer") {
      emit("select-layer", item.id);
    } else {
      emit("select-feature", item.id);
    }
  } else if (item.category === "Events") {
    emit("select-event", item);
  } else if (item.category === "Places") {
    emit("select-place", item);
  } else if (item.category === "Actions") {
    emit("select-action", item.action);
  }
  open.value = false;
}
</script>
