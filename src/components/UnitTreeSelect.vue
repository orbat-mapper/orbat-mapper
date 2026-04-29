<script setup lang="ts">
import { computed, ref } from "vue";
import { useVirtualizer } from "@tanstack/vue-virtual";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import UnitSymbol from "@/components/UnitSymbol.vue";
import UnitTreeSelectRow, {
  type UnitTreeHeaderRow,
  type UnitTreeUnitRow,
  type UnitTreeVisibleRow,
} from "@/components/UnitTreeSelectRow.vue";
import type { EntityId } from "@/types/base";
import type { NSide, NSideGroup, NUnit } from "@/types/internalModels";
import type { UnitSymbolOptions } from "@/types/scenarioModels";
import { shouldVirtualizeTree } from "@/components/orbatTreeVirtualization";

interface Props {
  label?: string;
  units: EntityId[];
  unitMap: Record<EntityId, NUnit>;
  sideMap?: Record<EntityId, NSide>;
  sideGroupMap?: Record<EntityId, NSideGroup>;
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
// Defaults differ between the two sets: sides/groups are open by default
// (tracked via `collapsedRows`), units are closed by default (tracked via
// `expandedUnits`). Don't merge them without flipping one set's semantics.
const collapsedRows = ref(new Set<string>());
const expandedUnits = ref(new Set<EntityId>());

const selectedUnit = computed(() =>
  selectedUnitId.value ? props.unitMap[selectedUnitId.value] : null,
);

function unitMatches(unit: NUnit, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  const side = props.sideMap?.[unit._sid]?.name;
  const group = unit._gid ? props.sideGroupMap?.[unit._gid]?.name : undefined;
  return (
    unit.name.toLowerCase().includes(q) ||
    !!unit.shortName?.toLowerCase().includes(q) ||
    unit.sidc.toLowerCase().includes(q) ||
    !!side?.toLowerCase().includes(q) ||
    !!group?.toLowerCase().includes(q)
  );
}

interface SideBucket {
  directUnits: EntityId[];
  groupOrder: EntityId[];
  groups: Map<EntityId, EntityId[]>;
}

function unitSymbolOptions(unit: NUnit): UnitSymbolOptions {
  const sideOptions = props.sideMap?.[unit._sid]?.symbolOptions ?? {};
  const groupOptions = unit._gid
    ? (props.sideGroupMap?.[unit._gid]?.symbolOptions ?? {})
    : {};
  return {
    outlineWidth: 8,
    ...sideOptions,
    ...groupOptions,
    ...props.symbolOptions,
    ...unit.symbolOptions,
  };
}

function sideRowKey(sideId: EntityId): string {
  return `side-${sideId}`;
}

function groupRowKey(groupId: EntityId): string {
  return `group-${groupId}`;
}

function rowKey(row: UnitTreeVisibleRow): string {
  if (row.type === "unit") return `unit-${row.unitId}`;
  return row.type === "side" ? sideRowKey(row.id) : groupRowKey(row.id);
}

const visibleRows = computed<UnitTreeVisibleRow[]>(() => {
  const rows: UnitTreeVisibleRow[] = [];
  const query = filterQuery.value.trim();
  const sideOrder: EntityId[] = [];
  const sideBuckets = new Map<EntityId, SideBucket>();

  // Memoize the recursive descendant match per visibleRows pass — without
  // this, deep trees re-walk subtrees O(N²) on every keystroke.
  const matchMemo = new Map<EntityId, boolean>();
  const matches = (unitId: EntityId): boolean => {
    const cached = matchMemo.get(unitId);
    if (cached !== undefined) return cached;
    const unit = props.unitMap[unitId];
    if (!unit) {
      matchMemo.set(unitId, false);
      return false;
    }
    const result = unitMatches(unit, query) || unit.subUnits.some((id) => matches(id));
    matchMemo.set(unitId, result);
    return result;
  };

  const sideBucket = (sideId: EntityId) => {
    let bucket = sideBuckets.get(sideId);
    if (!bucket) {
      bucket = { directUnits: [], groupOrder: [], groups: new Map() };
      sideBuckets.set(sideId, bucket);
      sideOrder.push(sideId);
    }
    return bucket;
  };

  props.units.forEach((unitId) => {
    const unit = props.unitMap[unitId];
    if (!unit || !matches(unitId)) return;
    const bucket = sideBucket(unit._sid);
    if (!unit._gid) {
      bucket.directUnits.push(unitId);
      return;
    }

    if (!bucket.groups.has(unit._gid)) {
      bucket.groups.set(unit._gid, []);
      bucket.groupOrder.push(unit._gid);
    }
    bucket.groups.get(unit._gid)!.push(unitId);
  });

  const appendUnits = (unitIds: EntityId[], level: number) => {
    unitIds.forEach((unitId) => {
      const unit = props.unitMap[unitId];
      if (!unit || !matches(unitId)) return;
      const hasChildren = unit.subUnits.some((id) => matches(id));
      const unitRow: UnitTreeUnitRow = {
        type: "unit",
        unitId,
        level,
        unit,
        symbolOptions: unitSymbolOptions(unit),
        hasChildren,
      };
      rows.push(unitRow);
      if (!query && !expandedUnits.value.has(unitId)) return;
      appendUnits(unit.subUnits, level + 1);
    });
  };

  sideOrder.forEach((sideId) => {
    const bucket = sideBuckets.get(sideId);
    if (!bucket) return;
    const side = props.sideMap?.[sideId];
    if (side) {
      const headerRow: UnitTreeHeaderRow = {
        type: "side",
        id: side.id,
        label: side.name,
        level: 0,
      };
      rows.push(headerRow);
    }

    if (side && collapsedRows.value.has(sideRowKey(side.id))) return;

    appendUnits(bucket.directUnits, side ? 1 : 0);

    bucket.groupOrder.forEach((groupId) => {
      const group = props.sideGroupMap?.[groupId];
      if (group) {
        const headerRow: UnitTreeHeaderRow = {
          type: "group",
          id: group.id,
          label: group.name,
          level: side ? 1 : 0,
        };
        rows.push(headerRow);
      }
      if (group && collapsedRows.value.has(groupRowKey(group.id))) return;
      appendUnits(bucket.groups.get(groupId) ?? [], side || group ? 2 : 0);
    });
  });

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

function rowIsOpen(row: UnitTreeVisibleRow): boolean {
  if (row.type === "unit") return expandedUnits.value.has(row.unitId);
  return !collapsedRows.value.has(rowKey(row));
}

function toggleRow(row: UnitTreeVisibleRow) {
  if (row.type === "unit") {
    const next = new Set(expandedUnits.value);
    if (next.has(row.unitId)) {
      next.delete(row.unitId);
    } else {
      next.add(row.unitId);
    }
    expandedUnits.value = next;
    return;
  }

  const next = new Set(collapsedRows.value);
  const key = rowKey(row);
  if (next.has(key)) {
    next.delete(key);
  } else {
    next.add(key);
  }
  collapsedRows.value = next;
}

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
              :options="unitSymbolOptions(selectedUnit)"
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
            <div
              v-for="virtualRow in virtualRows"
              :key="rowKey(visibleRows[virtualRow.index])"
              class="absolute left-0 w-full"
              :style="{
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }"
            >
              <UnitTreeSelectRow
                :row="visibleRows[virtualRow.index]"
                :selected="
                  visibleRows[virtualRow.index].type === 'unit' &&
                  selectedUnitId ===
                    (visibleRows[virtualRow.index] as UnitTreeUnitRow).unitId
                "
                :is-open="rowIsOpen(visibleRows[virtualRow.index])"
                virtualized
                @select="selectUnit"
                @toggle="toggleRow(visibleRows[virtualRow.index])"
              />
            </div>
          </div>
          <template v-else>
            <UnitTreeSelectRow
              v-for="row in visibleRows"
              :key="rowKey(row)"
              :row="row"
              :selected="row.type === 'unit' && selectedUnitId === row.unitId"
              :is-open="rowIsOpen(row)"
              @select="selectUnit"
              @toggle="toggleRow(row)"
            />
          </template>
          <p
            v-if="!visibleRows.some((row) => row.type === 'unit')"
            class="text-muted-foreground px-2 py-3 text-sm"
          >
            No units found.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  </Field>
</template>
