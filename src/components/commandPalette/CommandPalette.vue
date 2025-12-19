<script setup lang="ts">
import { computed, ref, watch, watchEffect } from "vue";
import {
  ListboxContent,
  ListboxGroup,
  ListboxGroupLabel,
  ListboxItem,
  ListboxRoot,
} from "reka-ui";
import { useDebounce } from "@vueuse/core";
import { useActionSearch, useScenarioSearch } from "@/composables/searching.ts";
import CommandPaletteUnitItem from "@/components/commandPalette/CommandPaletteUnitItem.vue";
import CommandPaletteLayerFeatureItem from "@/components/commandPalette/CommandPaletteLayerFeatureItem.vue";
import type {
  ActionSearchResult,
  EventSearchResult,
  LayerFeatureSearchResult,
  MapLayerSearchResult,
  UnitSearchResult,
} from "@/components/types.ts";
import CommandPaletteEventItem from "@/components/commandPalette/CommandPaletteEventItem.vue";
import { useGeoStore } from "@/stores/geoStore.ts";
import { toLonLat } from "ol/proj";
import { type PhotonSearchResult, useGeoSearch } from "@/composables/geosearching.ts";
import CommandPalettePlaceItem from "@/components/commandPalette/CommandPalettePlaceItem.vue";
import { useUiStore } from "@/stores/uiStore.ts";
import CommandPaletteActionItem from "@/components/commandPalette/CommandPaletteActionItem.vue";
import CommandPaletteImageLayerItem from "@/components/commandPalette/CommandPaletteImageLayerItem.vue";
import CommandPaletteDialog from "@/components/commandPalette/CommandPaletteDialog.vue";
import CommandPaletteInput from "@/components/commandPalette/CommandPaletteInput.vue";

const emit = defineEmits([
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
const open = defineModel<boolean>({ default: false });

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
  },
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
    | MapLayerSearchResult,
) {
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
</script>

<template>
  <CommandPaletteDialog v-model:open="open">
    <ListboxRoot
      data-slot="command"
      class="bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md"
      @update:modelValue="onSelect!"
    >
      <CommandPaletteInput v-model="rawQuery" />
      <ListboxContent
        data-slot="command-list"
        class="max-h-[60vh] scroll-py-1 overflow-x-hidden overflow-y-auto"
      >
        <div role="presentation">
          <ListboxGroup
            v-for="[source, hits] in groupedHits"
            :key="source"
            :id="source"
            data-slot="command-group"
            class="text-foreground overflow-hidden p-1"
          >
            <ListboxGroupLabel
              data-slot="command-group-heading"
              class="text-muted-foreground px-2 py-1.5 text-xs font-medium"
            >
              {{ source }}
            </ListboxGroupLabel>
            <ListboxItem
              v-for="item in hits"
              :key="item.id"
              data-slot="command-item"
              :value="item"
              class="data-highlighted:bg-accent data-highlighted:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
            >
              <CommandPaletteUnitItem v-if="item.category === 'Units'" :item />
              <CommandPaletteLayerFeatureItem
                v-else-if="item.category === 'Features'"
                :item
              />
              <CommandPaletteImageLayerItem
                v-else-if="item.category === 'Map layers'"
                :item
              />
              <CommandPaletteEventItem v-else-if="item.category === 'Events'" :item />
              <CommandPalettePlaceItem
                :item
                v-else-if="item.category === 'Places'"
                :center="mapCenter"
              />
              <CommandPaletteActionItem v-else-if="item.category === 'Actions'" :item />
              <p v-else>{{ item }}</p>
            </ListboxItem>
          </ListboxGroup>
        </div>
      </ListboxContent>
    </ListboxRoot>
  </CommandPaletteDialog>
</template>
