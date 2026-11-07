<script setup lang="ts">
import { computed, ref, shallowRef } from "vue";
import { ChevronUpIcon } from "@heroicons/vue/20/solid";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import LayerItemGlyph from "@/modules/scenarioeditor/LayerItemGlyph.vue";
import { getLayerItemLabel } from "@/modules/scenarioeditor/controlMeasureLayers";
import type { FeatureId } from "@/types/scenarioGeoModels";
import type { NScenarioLayerItem } from "@/types/scenarioLayerItems";

/** The layer tree picked from: features, control measures and other layer items. */
export interface LayerItemTreeLayer {
  id: FeatureId;
  name: string;
  items: NScenarioLayerItem[];
}

const props = withDefaults(
  defineProps<{
    label?: string;
    layers: LayerItemTreeLayer[];
    placeholder?: string;
  }>(),
  { label: "Feature", placeholder: "Select feature" },
);
const selectedItemId = defineModel<FeatureId | null>({ default: null });

const open = ref(false);
const filterQuery = ref("");
const collapsedLayers = shallowRef(new Set<FeatureId>());

const selectedItem = computed(() => {
  if (selectedItemId.value === null) return null;
  for (const layer of props.layers) {
    const item = layer.items.find((i) => i.id === selectedItemId.value);
    if (item) return item;
  }
  return null;
});

const visibleLayers = computed(() => {
  const q = filterQuery.value.trim().toLowerCase();
  return props.layers
    .map((layer) => {
      const layerMatches = !!q && layer.name.toLowerCase().includes(q);
      const items =
        !q || layerMatches
          ? layer.items
          : layer.items.filter((item) =>
              getLayerItemLabel(item).toLowerCase().includes(q),
            );
      return { layer, items };
    })
    .filter(({ items }) => items.length > 0);
});

function toggleLayer(layerId: FeatureId) {
  const next = new Set(collapsedLayers.value);
  if (next.has(layerId)) next.delete(layerId);
  else next.add(layerId);
  collapsedLayers.value = next;
}

function selectItem(itemId: FeatureId) {
  selectedItemId.value = itemId;
  open.value = false;
}
</script>

<template>
  <Field>
    <FieldLabel>{{ label }}</FieldLabel>
    <Popover v-model:open="open">
      <PopoverTrigger as-child>
        <Button
          type="button"
          variant="outline"
          class="h-10 w-full justify-start gap-2 px-3"
        >
          <template v-if="selectedItem">
            <LayerItemGlyph :item="selectedItem" aria-hidden="true" />
            <span class="truncate">{{ getLayerItemLabel(selectedItem) }}</span>
          </template>
          <span v-else class="text-muted-foreground truncate">{{ placeholder }}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" class="w-80 p-2">
        <Input
          v-model="filterQuery"
          type="search"
          placeholder="Filter features"
          class="mb-2"
        />
        <div class="max-h-80 overflow-y-auto pr-1">
          <div v-for="{ layer, items } in visibleLayers" :key="layer.id" class="pt-2">
            <button
              type="button"
              class="text-muted-foreground hover:text-foreground flex w-full items-center justify-between rounded px-2 pb-1 text-left text-[11px] leading-none font-semibold tracking-wide uppercase"
              @click="toggleLayer(layer.id)"
            >
              <span class="truncate">{{ layer.name }}</span>
              <ChevronUpIcon
                class="size-4 shrink-0 transition-transform"
                :class="collapsedLayers.has(layer.id) ? '' : 'rotate-180'"
              />
            </button>
            <template v-if="!collapsedLayers.has(layer.id)">
              <button
                v-for="item in items"
                :key="item.id"
                type="button"
                class="hover:bg-accent flex min-h-8 w-full items-center gap-2 rounded py-1.5 pr-2 pl-4 text-left text-sm"
                :class="item.id === selectedItemId ? 'bg-accent font-semibold' : ''"
                @click="selectItem(item.id)"
              >
                <LayerItemGlyph :item="item" aria-hidden="true" />
                <span class="truncate">{{ getLayerItemLabel(item) }}</span>
              </button>
            </template>
          </div>
          <p v-if="!visibleLayers.length" class="text-muted-foreground px-2 py-3 text-sm">
            No features found.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  </Field>
</template>
