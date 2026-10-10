<script setup lang="ts">
import {
  computed,
  inject,
  nextTick,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  useTemplateRef,
  watch,
} from "vue";
import { ChevronDown, ChevronsDownUp, ChevronsUpDown } from "@lucide/vue";
import type { ControlMeasureId } from "@orbat-mapper/control-measures";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Empty, EmptyDescription } from "@/components/ui/empty";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Toggle } from "@/components/ui/toggle";
import { scenarioDrawKey } from "@/components/injects";
import { useControlMeasureToolStore } from "@/stores/controlMeasureToolStore";
import { isPointSymbolSizeUnit } from "@/geo/pointSymbolSizing";
import { Sidc } from "@/symbology/sidc";
import type { CataloguePlacement } from "@/types/draggables";
import { pointSymbolSidcWithIdentity } from "@/modules/scenarioeditor/pointSymbolDrawHelpers";
import ControlMeasureCatalogueTile from "@/modules/scenarioeditor/ControlMeasureCatalogueTile.vue";
import ControlMeasureCatalogueReadout, {
  CONTROL_MEASURE_CATALOGUE_HOVERED,
} from "@/modules/scenarioeditor/ControlMeasureCatalogueReadout.vue";
import {
  CONTROL_MEASURE_CATALOGUE_FILTERS,
  CONTROL_MEASURE_CELL_SIZES,
  type ControlMeasureCatalogueEntry,
  pointSymbolEntryKey,
  useControlMeasureCatalogue,
} from "@/modules/scenarioeditor/controlMeasureCatalogue";

/**
 * The control-measure catalogue as the Graphics sidebar tab, after tactrace's own.
 *
 * Click a tile to arm it and draw as from the toolbar, or drag it onto the map to
 * place its sample shape where it is dropped.
 */
const {
  query,
  filter,
  collapsed,
  scrollTop,
  groups,
  entries,
  cellSize,
  descriptionsVisible,
} = useControlMeasureCatalogue();

// Injected rather than required: the panel is also reachable before a map is ready.
const scenarioDraw = inject(scenarioDrawKey, null);
const toolStore = useControlMeasureToolStore();

const disabled = computed(() => !scenarioDraw?.canControlMeasures.value);
/** The armed tile, keyed like the entries: a kind id, or `symbol:<code>`. */
const armedKey = computed(() => {
  const armed = scenarioDraw?.armed.value;
  if (armed?.kind === "cmDraw") return armed.graphicKind;
  if (armed?.kind === "psDraw") return pointSymbolEntryKey(new Sidc(armed.sidc).mainIcon);
  return null;
});

/**
 * What a tile places. A point symbol takes the identity new control measures are
 * born with, so the two kinds of entry agree on Friend/Hostile without a second
 * setting.
 */
function placementFor(entry: ControlMeasureCatalogueEntry): CataloguePlacement {
  if (entry.type === "measure") return { type: "measure", graphicKind: entry.id };
  return {
    type: "symbol",
    sidc: pointSymbolSidcWithIdentity(entry.sidc, toolStore.defaults.standardIdentity),
    name: entry.name,
  };
}

/**
 * Built once per catalogue or identity change — not per search — so a re-render keeps
 * each tile's prop.
 */
const placements = computed(
  () => new Map(entries.value.map((entry) => [entry.key, placementFor(entry)] as const)),
);

function setPointSymbolSizeUnit(unit: unknown) {
  if (isPointSymbolSizeUnit(unit)) toolStore.pointSymbolSizeUnit = unit;
}

function arm(entry: ControlMeasureCatalogueEntry) {
  if (!scenarioDraw) return;
  if (armedKey.value === entry.key) {
    scenarioDraw.cancel();
    return;
  }
  const placement = placements.value.get(entry.key)!;
  if (placement.type === "symbol") {
    scenarioDraw.arm({ kind: "psDraw", sidc: placement.sidc, name: placement.name });
    return;
  }
  const kind: ControlMeasureId = placement.graphicKind;
  // As the toolbar's picker does: remember the kind for the defaults popover, and pin
  // it so the kinds actually drawn end up one click away on the toolbar.
  toolStore.lastKind = kind;
  toolStore.pinKind(kind);
  scenarioDraw.arm({ kind: "cmDraw", graphicKind: kind });
}

// A search opens every section, with folding choices of its own, so browsing resumes
// where it was left when the query is cleared.
const searchCollapsed = ref(new Set<string>());
const sectionState = computed(() =>
  query.value.trim() ? searchCollapsed.value : collapsed,
);
const isOpen = (entity: string) => !sectionState.value.has(entity);
function setOpen(entity: string, open: boolean) {
  if (open) sectionState.value.delete(entity);
  else sectionState.value.add(entity);
}
const anySectionOpen = computed(() => groups.value.some((group) => isOpen(group.entity)));
const sectionsAction = computed(() =>
  anySectionOpen.value ? "Collapse all sections" : "Expand all sections",
);
function toggleSections() {
  const collapse = anySectionOpen.value;
  for (const group of groups.value) setOpen(group.entity, !collapse);
  hovered.value = null;
}

const hovered = ref<string | null>(null);
provide(CONTROL_MEASURE_CATALOGUE_HOVERED, hovered);
const total = computed(() => {
  const count = groups.value.reduce((sum, group) => sum + group.items.length, 0);
  return `${count} control measure${count === 1 ? "" : "s"}`;
});

const scroller = useTemplateRef("scroller");
onMounted(async () => {
  await nextTick();
  if (scroller.value) scroller.value.scrollTop = scrollTop.value;
});
onBeforeUnmount(() => {
  if (scroller.value) scrollTop.value = scroller.value.scrollTop;
});
watch([query, filter], () => {
  searchCollapsed.value.clear();
  hovered.value = null;
  if (scroller.value) scroller.value.scrollTop = 0;
});

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(auto-fill, minmax(${CONTROL_MEASURE_CELL_SIZES[cellSize.value].width}px, 1fr))`,
}));
const chipClass = "h-7 min-w-0 px-2 text-xs";
</script>

<template>
  <section class="flex h-full min-h-0 flex-col" aria-label="Graphics">
    <div class="flex shrink-0 flex-col gap-2 border-b px-3 py-3">
      <Input
        v-model="query"
        type="search"
        aria-label="Search control measures"
        placeholder="Search control measures…"
        class="h-8"
      />
      <ToggleGroup
        :model-value="filter"
        type="single"
        size="sm"
        variant="outline"
        class="w-full flex-wrap justify-start"
        aria-label="Geometry filter"
        @update:model-value="(value) => value && (filter = value as typeof filter)"
      >
        <ToggleGroupItem
          v-for="option in CONTROL_MEASURE_CATALOGUE_FILTERS"
          :key="option.value"
          :value="option.value"
          :class="chipClass"
          >{{ option.label }}</ToggleGroupItem
        >
      </ToggleGroup>
      <div class="flex items-center justify-between gap-2">
        <p class="text-muted-foreground text-xs">
          Click to draw, or drag onto the map to place.
        </p>
        <ToggleGroup
          :model-value="toolStore.pointSymbolSizeUnit"
          type="single"
          size="sm"
          variant="outline"
          aria-label="Size of new point symbols"
          @update:model-value="setPointSymbolSizeUnit"
        >
          <ToggleGroupItem
            value="pixels"
            title="New point symbols keep their size on screen"
            :class="chipClass"
            >px</ToggleGroupItem
          >
          <ToggleGroupItem
            value="meters"
            title="New point symbols are sized on the ground and scale with the map"
            :class="chipClass"
            >m</ToggleGroupItem
          >
        </ToggleGroup>
      </div>
    </div>
    <p
      v-if="disabled"
      class="text-muted-foreground shrink-0 border-b px-3 py-2 text-xs"
      role="status"
    >
      Control measures can't be drawn on this map yet.
    </p>
    <div
      ref="scroller"
      class="min-h-0 flex-1 overflow-y-auto px-2 pb-2"
      @mouseleave="hovered = null"
    >
      <Empty v-if="!groups.length" role="status">
        <EmptyDescription>No matching control measures.</EmptyDescription>
      </Empty>
      <Collapsible
        v-for="group in groups"
        :key="group.entity"
        :open="isOpen(group.entity)"
        @update:open="(open: boolean) => setOpen(group.entity, open)"
      >
        <h3 class="bg-sidebar sticky top-0 z-10">
          <CollapsibleTrigger as-child>
            <Button
              variant="ghost"
              size="sm"
              class="h-auto min-h-9 w-full justify-start gap-2 px-2 py-2 text-left text-[13px] leading-5 font-semibold"
            >
              <ChevronDown
                class="transition-transform"
                :class="{ '-rotate-90': !isOpen(group.entity) }"
              />
              <span class="min-w-0 flex-1 whitespace-normal">{{ group.entity }}</span>
              <span class="text-muted-foreground text-xs font-normal tabular-nums">{{
                group.items.length
              }}</span>
            </Button>
          </CollapsibleTrigger>
        </h3>
        <CollapsibleContent>
          <div class="grid items-start gap-x-1 gap-y-2 pb-3" :style="gridStyle">
            <ControlMeasureCatalogueTile
              v-for="option in group.items"
              :key="option.key"
              :option="option"
              :placement="placements.get(option.key)!"
              :cell-size="cellSize"
              :descriptions-visible="descriptionsVisible"
              :disabled="disabled"
              :armed="armedKey === option.key"
              @arm="arm(option)"
              @hover="hovered = $event"
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
    <ControlMeasureCatalogueReadout :total="total" />
    <div class="flex shrink-0 items-center justify-between gap-2 border-t px-2 py-1.5">
      <ToggleGroup
        :model-value="cellSize"
        type="single"
        size="sm"
        variant="outline"
        aria-label="Cell size"
        @update:model-value="(value) => value && (cellSize = value as typeof cellSize)"
      >
        <ToggleGroupItem
          v-for="(size, value) in CONTROL_MEASURE_CELL_SIZES"
          :key="value"
          :value="value"
          :aria-label="`${size.label} cells`"
          :title="`${size.label} cells`"
          :class="chipClass"
          >{{ size.short }}</ToggleGroupItem
        >
      </ToggleGroup>
      <Button
        variant="ghost"
        size="icon-sm"
        :aria-label="sectionsAction"
        :title="sectionsAction"
        :disabled="!groups.length"
        @click="toggleSections"
      >
        <ChevronsDownUp v-if="anySectionOpen" />
        <ChevronsUpDown v-else />
      </Button>
      <Toggle
        v-model="descriptionsVisible"
        size="sm"
        variant="outline"
        aria-label="Show descriptions"
        :class="chipClass"
        >Descriptions</Toggle
      >
    </div>
  </section>
</template>
