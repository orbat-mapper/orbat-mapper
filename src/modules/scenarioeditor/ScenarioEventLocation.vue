<script setup lang="ts">
import { computed } from "vue";
import bboxPolygon from "@turf/bbox-polygon";
import { MapPinIcon, XIcon } from "@lucide/vue";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UnitSymbol from "@/components/UnitSymbol.vue";
import UnitTreeSelect from "@/components/UnitTreeSelect.vue";
import LayerItemTreeSelect from "@/modules/scenarioeditor/LayerItemTreeSelect.vue";
import type { FeatureId } from "@/types/scenarioGeoModels";
import { useRootUnitIds } from "@/composables/scenarioUtils";
import LayerItemGlyph from "@/modules/scenarioeditor/LayerItemGlyph.vue";
import { getLayerItemLabel } from "@/modules/scenarioeditor/controlMeasureLayers";
import {
  type EventLocationItems,
  eventLocationCameraOptions,
  eventLocationFromItems,
  eventLocationItems,
  useEventLocation,
} from "@/modules/scenarioeditor/scenarioEvents";
import { useGeoStore } from "@/stores/geoStore";
import type { EventLocation, UnitSymbolOptions } from "@/types/scenarioModels";
import type { EntityId } from "@/types/base";
import type { NScenarioLayerItem } from "@/types/scenarioLayerItems";

defineProps<{
  /** Shows the controls that change the location; otherwise it is read-only. */
  editable?: boolean;
}>();
/** The location being shown or edited. Edits stay here until the owner saves them. */
const where = defineModel<EventLocation | undefined>("where");

const {
  store: { state },
  geo,
  helpers: { getUnitById },
  unitActions,
} = injectStrict(activeScenarioKey);
const geoStore = useGeoStore();
const { showEventLocation, eventLocationOutline } = useEventLocation();
const { rootUnitIds } = useRootUnitIds();

const items = computed(() => eventLocationItems(where.value));
const isKnownType = computed(
  () => !where.value || ["units", "geometry", "items"].includes(where.value.type),
);

/** `list` names the array in `items` the chip came from. */
type Chip = { id: string | number; label: string } & (
  | { kind: "unit"; list: "units"; sidc: string; options: UnitSymbolOptions }
  | { kind: "feature"; list: "features"; item: NScenarioLayerItem }
  | { kind: "missing"; list: keyof EventLocationItems }
);

const chips = computed((): Chip[] => [
  ...items.value.units.map((id): Chip => {
    const unit = getUnitById(id);
    if (!unit) return { kind: "missing", list: "units", id, label: "Missing unit" };
    return {
      kind: "unit",
      list: "units",
      id,
      label: unit.shortName || unit.name,
      sidc: unit._state?.sidc ?? unit.sidc,
      options: unitActions.getCombinedSymbolOptions(unit),
    };
  }),
  ...items.value.features.map((id): Chip => {
    const item = state.layerItemMap[id];
    if (!item) return { kind: "missing", list: "features", id, label: "Missing item" };
    return {
      kind: "feature",
      list: "features",
      id,
      label: getLayerItemLabel(item),
      item,
    };
  }),
]);

function setItems(newItems: EventLocationItems) {
  where.value = eventLocationFromItems(newItems, where.value);
}

function removeChip(chip: Chip) {
  const { units, features } = items.value;
  setItems({
    units: chip.list === "units" ? units.filter((id) => id !== chip.id) : units,
    features:
      chip.list === "features" ? features.filter((id) => id !== chip.id) : features,
  });
}

function addUnit(unitId: EntityId | null) {
  const { units, features } = items.value;
  if (!unitId || units.includes(unitId)) return;
  setItems({ units: [...units, unitId], features });
}

function addFeature(featureId: FeatureId | null) {
  const { units, features } = items.value;
  if (featureId === null || features.includes(featureId)) return;
  setItems({ units, features: [...features, featureId] });
}

function useCurrentView() {
  const bbox = geoStore.getUnobstructedMapViewBbox();
  if (!bbox) return;
  const newWhere: EventLocation = {
    type: "geometry",
    geometry: bboxPolygon(bbox).geometry,
    ...eventLocationCameraOptions(where.value),
  };
  where.value = newWhere;
  // The area is already in view, so outline it without moving the map.
  const outline = eventLocationOutline(newWhere);
  if (outline) geoStore.flashOutline(outline);
}

function onMaxZoomChange(value: string) {
  if (!where.value) return;
  const zoom = Number(value);
  const newWhere = { ...where.value };
  if (value === "" || !Number.isFinite(zoom)) delete newWhere.maxZoom;
  else newWhere.maxZoom = zoom;
  where.value = newWhere;
}
</script>

<template>
  <section class="mt-6 space-y-3 border-t pt-4" aria-labelledby="event-location-heading">
    <div class="flex items-center justify-between gap-2">
      <h3 id="event-location-heading" class="text-muted-foreground text-sm font-medium">
        Location
      </h3>
      <div class="flex gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          :disabled="!where || !isKnownType"
          @click="showEventLocation(where)"
          >Show area</Button
        >
        <Button
          v-if="editable"
          type="button"
          variant="ghost"
          size="sm"
          :disabled="!where"
          @click="where = undefined"
          >Clear</Button
        >
      </div>
    </div>

    <p v-if="!where" class="text-muted-foreground text-sm">
      Not set. The map stays where it is when this event is reached.
    </p>
    <p v-else-if="!isKnownType" class="text-muted-foreground text-sm">
      Set by a newer version of ORBAT Mapper.{{
        editable ? " Clear it to set a new location." : ""
      }}
    </p>
    <p v-else-if="where.type === 'geometry'" class="flex items-center gap-2 text-sm">
      <MapPinIcon class="text-muted-foreground size-4" aria-hidden="true" />
      Map area ({{ where.geometry.type }})
    </p>

    <ul v-if="chips.length" class="flex flex-wrap gap-1.5" aria-label="Units and items">
      <li
        v-for="chip in chips"
        :key="`${chip.kind}-${chip.id}`"
        class="bg-muted inline-flex items-center gap-1.5 rounded-md py-0.5 pr-1 pl-2 text-sm"
        :class="chip.kind === 'missing' && 'text-muted-foreground italic'"
      >
        <UnitSymbol
          v-if="chip.kind === 'unit'"
          :sidc="chip.sidc"
          :size="12"
          :options="chip.options"
        />
        <LayerItemGlyph
          v-else-if="chip.kind === 'feature'"
          :item="chip.item"
          aria-hidden="true"
        />
        <span class="max-w-40 truncate">{{ chip.label }}</span>
        <button
          v-if="editable"
          type="button"
          class="hover:bg-background text-muted-foreground rounded p-0.5"
          :aria-label="`Remove ${chip.label}`"
          @click="removeChip(chip)"
        >
          <XIcon class="size-3.5" />
        </button>
      </li>
    </ul>

    <div v-if="editable && isKnownType" class="space-y-2">
      <!-- Reset after each pick, so the button always offers to add another unit. -->
      <UnitTreeSelect
        label="Units"
        :placeholder="where?.type === 'geometry' ? 'Replace with a unit…' : 'Add unit…'"
        :units="rootUnitIds"
        :unit-map="state.unitMap"
        :side-map="state.sideMap"
        :side-group-map="state.sideGroupMap"
        :model-value="null"
        @update:model-value="addUnit"
      />
      <LayerItemTreeSelect
        label="Features and control measures"
        :placeholder="
          where?.type === 'geometry'
            ? 'Replace with a feature or control measure…'
            : 'Add feature or control measure…'
        "
        :layers="geo.layerItemsLayers.value"
        :model-value="null"
        @update:model-value="addFeature"
      />
    </div>

    <div v-if="editable" class="flex flex-wrap items-end justify-between gap-3">
      <Button type="button" variant="outline" size="sm" @click="useCurrentView()"
        >Use current map view</Button
      >
      <label class="text-muted-foreground flex items-center gap-2 text-sm">
        Max zoom
        <Input
          type="number"
          min="1"
          max="22"
          class="h-8 w-20"
          placeholder="Auto"
          :disabled="!where || !isKnownType"
          :model-value="where?.maxZoom ?? ''"
          @change="onMaxZoomChange(($event.target as HTMLInputElement).value)"
        />
      </label>
    </div>
  </section>
</template>
