<script setup lang="ts">
import { computed, ref } from "vue";
import { useVirtualizer } from "@tanstack/vue-virtual";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import UnitSymbol from "@/components/UnitSymbol.vue";
import type { EntityId } from "@/types/base";
import type { NUnit } from "@/types/internalModels";
import type { UnitSymbolOptions } from "@/types/scenarioModels";
import { shouldVirtualizeTree } from "@/components/orbatTreeVirtualization";

interface Props {
  label?: string;
  units: EntityId[];
  unitMap: Record<EntityId, NUnit>;
  symbolOptions?: UnitSymbolOptions;
  placeholder?: string;
  virtualizationThreshold?: number;
  rowHeight?: number;
  overscan?: number;
}

const props = withDefaults(defineProps<Props>(), {
  label: "Unit",
  placeholder: "Select unit",
  virtualizationThreshold: 80,
  rowHeight: 36,
  overscan: 12,
});
const selectedUnitId = defineModel<EntityId | null>({ default: null });

const open = ref(false);
const filterQuery = ref("");
const viewportRef = ref<HTMLElement | null>(null);

const selectedUnit = computed(() =>
  selectedUnitId.value ? props.unitMap[selectedUnitId.value] : null,
);

function unitMatches(unit: NUnit, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    unit.name.toLowerCase().includes(q) ||
    unit.shortName?.toLowerCase().includes(q) ||
    unit.sidc.toLowerCase().includes(q)
  );
}

function unitOrDescendantMatches(unitId: EntityId, query: string): boolean {
  const unit = props.unitMap[unitId];
  if (!unit) return false;
  if (unitMatches(unit, query)) return true;
  return unit.subUnits.some((childId) => unitOrDescendantMatches(childId, query));
}

function isVisible(unitId: EntityId): boolean {
  return unitOrDescendantMatches(unitId, filterQuery.value.trim());
}

interface UnitTreeRow {
  unitId: EntityId;
  level: number;
}

const visibleRows = computed(() => {
  const rows: UnitTreeRow[] = [];
  const query = filterQuery.value.trim();
  const walk = (unitIds: EntityId[], level: number) => {
    unitIds.forEach((unitId) => {
      const unit = props.unitMap[unitId];
      if (!unit || !unitOrDescendantMatches(unitId, query)) return;
      rows.push({ unitId, level });
      walk(unit.subUnits, level + 1);
    });
  };
  walk(props.units, 0);
  return rows;
});

const isVirtualized = computed(() =>
  shouldVirtualizeTree(visibleRows.value.length, props.virtualizationThreshold),
);

const rowVirtualizerOptions = computed(() => ({
  count: visibleRows.value.length,
  getScrollElement: () => viewportRef.value,
  estimateSize: () => props.rowHeight,
  overscan: props.overscan,
}));

const rowVirtualizer = useVirtualizer(rowVirtualizerOptions);
const virtualRows = computed(() => rowVirtualizer.value.getVirtualItems());
const totalSize = computed(() => rowVirtualizer.value.getTotalSize());

function selectUnit(unitId: EntityId) {
  selectedUnitId.value = unitId;
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
          <template v-if="selectedUnit">
            <UnitSymbol
              class="size-6 shrink-0"
              :sidc="selectedUnit.sidc"
              :size="18"
              :options="{
                outlineWidth: 8,
                ...symbolOptions,
                ...selectedUnit.symbolOptions,
              }"
            />
            <span class="truncate">{{ selectedUnit.name }}</span>
          </template>
          <span v-else class="text-muted-foreground truncate">{{ placeholder }}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" class="w-80 p-2">
        <Input
          v-model="filterQuery"
          type="search"
          placeholder="Filter units"
          class="mb-2"
        />
        <div ref="viewportRef" class="max-h-80 overflow-y-auto pr-1">
          <div
            v-if="isVirtualized"
            :style="{ height: `${totalSize}px` }"
            class="relative"
          >
            <button
              v-for="virtualRow in virtualRows"
              :key="visibleRows[virtualRow.index].unitId"
              type="button"
              class="hover:bg-accent absolute left-0 flex min-h-8 w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm"
              :class="
                selectedUnitId === visibleRows[virtualRow.index].unitId
                  ? 'bg-accent font-semibold'
                  : ''
              "
              :style="{
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
                paddingLeft: `${0.5 + visibleRows[virtualRow.index].level * 1}rem`,
              }"
              @click="selectUnit(visibleRows[virtualRow.index].unitId)"
            >
              <UnitSymbol
                class="size-6 shrink-0"
                :sidc="unitMap[visibleRows[virtualRow.index].unitId].sidc"
                :size="18"
                :options="{
                  outlineWidth: 8,
                  ...symbolOptions,
                  ...unitMap[visibleRows[virtualRow.index].unitId].symbolOptions,
                }"
              />
              <span class="truncate">{{
                unitMap[visibleRows[virtualRow.index].unitId].name
              }}</span>
            </button>
          </div>
          <template v-else>
            <button
              v-for="row in visibleRows"
              :key="row.unitId"
              type="button"
              class="hover:bg-accent flex min-h-8 w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm"
              :class="selectedUnitId === row.unitId ? 'bg-accent font-semibold' : ''"
              :style="{ paddingLeft: `${0.5 + row.level * 1}rem` }"
              @click="selectUnit(row.unitId)"
            >
              <UnitSymbol
                class="size-6 shrink-0"
                :sidc="unitMap[row.unitId].sidc"
                :size="18"
                :options="{
                  outlineWidth: 8,
                  ...symbolOptions,
                  ...unitMap[row.unitId].symbolOptions,
                }"
              />
              <span class="truncate">{{ unitMap[row.unitId].name }}</span>
            </button>
          </template>
          <p v-if="!visibleRows.length" class="text-muted-foreground px-2 py-3 text-sm">
            No units found.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  </Field>
</template>
