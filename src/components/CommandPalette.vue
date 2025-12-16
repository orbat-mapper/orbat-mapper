<script setup lang="ts">
import { computed, nextTick, ref, watch, watchEffect } from "vue";
import { MagnifyingGlassIcon } from "@heroicons/vue/20/solid";
import { ExclamationTriangleIcon } from "@heroicons/vue/24/outline";
import {
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  ListboxContent,
  ListboxGroup,
  ListboxGroupLabel,
  ListboxItem,
  ListboxRoot,
} from "reka-ui";
import CommandPaletteFooter from "@/components/CommandPaletteFooter.vue";
import CommandPaletteHelp from "@/components/CommandPaletteHelp.vue";
import { useDebounce, useVModel } from "@vueuse/core";
import { useActionSearch, useScenarioSearch } from "@/composables/searching";
import CommandPaletteUnitItem from "@/components/CommandPaletteUnitItem.vue";
import CommandPaletteLayerFeatureItem from "@/components/CommandPaletteLayerFeatureItem.vue";
import type {
  ActionSearchResult,
  EventSearchResult,
  LayerFeatureSearchResult,
  MapLayerSearchResult,
  UnitSearchResult,
} from "@/components/types";
import CommandPaletteEventItem from "@/components/CommandPaletteEventItem.vue";
import { useGeoStore } from "@/stores/geoStore";
import { toLonLat } from "ol/proj";
import { type PhotonSearchResult, useGeoSearch } from "@/composables/geosearching";
import CommandPalettePlaceItem from "@/components/CommandPalettePlaceItem.vue";
import { useUiStore } from "@/stores/uiStore";
import CommandPaletteActionItem from "@/components/CommandPaletteActionItem.vue";
import CommandPaletteImageLayerItem from "@/components/CommandPaletteImageLayerItem.vue";

type SearchResultItem =
  | UnitSearchResult
  | LayerFeatureSearchResult
  | EventSearchResult
  | ExtendedPhotonSearchResult
  | ActionSearchResult
  | MapLayerSearchResult;

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits([
  "update:modelValue",
  "select-unit",
  "select-layer",
  "select-feature",
  "select-place",
  "select-event",
  "select-action",
  "select-image-layer",
]);

const geoStore = useGeoStore();
const uiStore = useUiStore();
const { photonSearch } = useGeoSearch();
const { searchActions, actionItems } = useActionSearch();
const open = useVModel(props, "modelValue", emit);

const rawQuery = ref("");
const query = computed(() => rawQuery.value.replace(/^[#@>]/, ""));
const showHelp = computed(() => rawQuery.value === "?");
const isGeoSearch = computed(
  () => uiStore.searchGeoMode || rawQuery.value.startsWith("@"),
);

const isActionSearch = computed(
  () => rawQuery.value.startsWith("#") || rawQuery.value.startsWith(">"),
);

const debouncedQuery = useDebounce(query, 200);
const geoDebouncedQuery = useDebounce(query, 500);
const { search } = useScenarioSearch(searchActions);

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
const searchInputRef = ref<HTMLInputElement | null>(null);
const highlightedItem = ref<SearchResultItem | null>(null);

watch(open, (isOpen) => {
  if (isOpen) {
    if (geoStore.olMap) {
      const center = geoStore.olMap.getView().getCenter();
      mapCenter.value = center && toLonLat(center);
    } else {
      mapCenter.value = null;
    }
    // Focus the search input when the dialog opens
    nextTick(() => {
      searchInputRef.value?.focus();
    });
  } else {
    // Reset state when dialog closes
    rawQuery.value = "";
    highlightedItem.value = null;
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
  },
);

watch([() => isActionSearch.value, () => query.value.trim()], async ([isa, q]) => {
  if (!isa) return;
  const filteredActions = q ? searchActions(q) : actionItems;
  groupedHits.value = new Map([["Actions", filteredActions]]);
  hitCount.value = filteredActions.length;
});

function onSelect(value: unknown) {
  const item = value as SearchResultItem;
  if (item.category === "Units") emit("select-unit", item.id);
  else if (item.category === "Features") {
    if (item.type === "layer") {
      emit("select-layer", item.id);
    } else {
      emit("select-feature", item.id);
    }
  } else if (item.category === "Map layers") {
    emit("select-image-layer", item.id);
  } else if (item.category === "Events") {
    emit("select-event", item);
  } else if (item.category === "Places") {
    emit("select-place", item);
  } else if (item.category === "Actions") {
    emit("select-action", item.action);
  }
  open.value = false;
}

function onHighlight(payload: { ref: HTMLElement; value: unknown } | undefined) {
  if (!payload?.value) {
    highlightedItem.value = null;
    return;
  }
  // Basic type guard - check for required category property
  const item = payload.value as Record<string, unknown>;
  if (typeof item === "object" && item !== null && "category" in item) {
    highlightedItem.value = payload.value as SearchResultItem;
  }
}

function isItemHighlighted(item: SearchResultItem): boolean {
  if (!highlightedItem.value) return false;
  return highlightedItem.value.id === item.id;
}

function handleSearchInput(event: Event) {
  rawQuery.value = (event.target as HTMLInputElement).value;
}
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <Transition
        enter-active-class="ease-out duration-300"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="ease-in duration-200"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <DialogOverlay
          v-if="open"
          class="fixed inset-0 bg-gray-500/50 transition-opacity"
        />
      </Transition>

      <div v-if="open" class="fixed inset-0 z-10 overflow-y-auto p-4 sm:p-6 md:p-20">
        <Transition
          enter-active-class="ease-out duration-300"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="ease-in duration-200"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <DialogContent
            v-if="open"
            class="ring-opacity-5 mx-auto max-w-xl transform divide-y divide-gray-100 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black transition-all"
            :class="isGeoSearch && 'bg-red-500'"
            @interact-outside.prevent
          >
            <DialogClose class="sr-only">Close</DialogClose>
            <ListboxRoot
              highlight-on-hover
              @update:model-value="onSelect"
              @highlight="onHighlight"
            >
              <div class="relative">
                <MagnifyingGlassIcon
                  class="pointer-events-none absolute top-3.5 left-4 h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
                <input
                  ref="searchInputRef"
                  class="h-12 w-full border-0 bg-transparent pr-4 pl-11 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                  placeholder="Search..."
                  :value="rawQuery"
                  @input="handleSearchInput"
                />
              </div>

              <ListboxContent
                v-if="groupedHits && hitCount > 0"
                class="max-h-80 scroll-py-10 scroll-pb-2 space-y-4 overflow-y-auto p-4 pb-2 sm:max-h-[60vh]"
              >
                <ListboxGroup
                  v-for="[source, hits] in groupedHits"
                  :key="source"
                  class="list-none"
                >
                  <ListboxGroupLabel class="text-xs font-semibold text-gray-900">
                    {{ source }}
                  </ListboxGroupLabel>
                  <ul class="-mx-4 mt-2 text-sm font-medium text-gray-700">
                    <ListboxItem
                      v-for="item in hits"
                      :key="item.id"
                      :value="item"
                      as-child
                    >
                      <CommandPaletteUnitItem
                        v-if="item.category === 'Units'"
                        :item="item"
                        :active="isItemHighlighted(item)"
                      />
                      <CommandPaletteLayerFeatureItem
                        v-else-if="item.category === 'Features'"
                        :active="isItemHighlighted(item)"
                        :item="item"
                      />
                      <CommandPaletteImageLayerItem
                        v-else-if="item.category === 'Map layers'"
                        :active="isItemHighlighted(item)"
                        :item="item"
                      />
                      <CommandPaletteEventItem
                        v-else-if="item.category === 'Events'"
                        :active="isItemHighlighted(item)"
                        :item="item"
                      />
                      <CommandPalettePlaceItem
                        :item="item"
                        v-else-if="item.category === 'Places'"
                        :active="isItemHighlighted(item)"
                        :center="mapCenter"
                      />
                      <CommandPaletteActionItem
                        v-else-if="item.category === 'Actions'"
                        :active="isItemHighlighted(item)"
                        :item="item"
                      />
                      <p v-else>{{ item }}</p>
                    </ListboxItem>
                  </ul>
                </ListboxGroup>
              </ListboxContent>

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
            </ListboxRoot>
          </DialogContent>
        </Transition>
      </div>
    </DialogPortal>
  </DialogRoot>
</template>
