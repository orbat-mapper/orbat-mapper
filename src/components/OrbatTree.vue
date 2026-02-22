<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import OrbatTreeItem from "./OrbatTreeItem.vue";
import { type UnitAction, UnitActions } from "@/types/constants";
import type { EntityId } from "@/types/base";
import type { NOrbatItemData, NUnit } from "@/types/internalModels";
import { filterUnits } from "@/composables/filtering";
import { type UnitSymbolOptions } from "@/types/scenarioModels";
import { TreeItem, TreeRoot, TreeVirtualizer } from "reka-ui";
import { moveFocusToNearestOrbatNavTarget } from "@/modules/scenarioeditor/orbatNav";
import { useSelectedItems } from "@/stores/selectedStore";
import { useLocalStorage } from "@vueuse/core";
import {
  flattenVisibleTreeIds,
  getVisibleTreeIndexByUnitId,
  shouldVirtualizeTree,
} from "@/components/orbatTreeVirtualization";

interface Props {
  units: EntityId[];
  unitMap: Record<EntityId, NUnit>;
  filterQuery?: string;
  locationFilter?: boolean;
  symbolOptions?: UnitSymbolOptions;
  virtualizationThreshold?: number;
  virtualEstimateSize?: number;
  virtualOverscan?: number;
  virtualViewportClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  filterQuery: "",
  locationFilter: false,
  virtualizationThreshold: 150,
  virtualEstimateSize: 40,
  virtualOverscan: 12,
  virtualViewportClass: "max-h-[45vh] md:max-h-[55vh] overflow-y-auto overscroll-contain",
});

interface Emits {
  (e: "unit-action", unit: NUnit, action: UnitAction): void;

  (e: "unit-click", unit: NUnit, event: MouseEvent): void;
}

const emit = defineEmits<Emits>();

const onUnitAction = (unit: NUnit, action: UnitAction) => {
  if (action === UnitActions.Expand) {
    expandSubtree(unit.id);
  }
  if (action === UnitActions.Collapse) {
    collapseSubtree(unit.id);
  }
  emit("unit-action", unit, action);
};

const onTreeItemSelect = (
  item: NOrbatItemData,
  event: CustomEvent<{ originalEvent: Event }>,
) => {
  emit("unit-click", item.unit, event.detail.originalEvent as MouseEvent);
};

const onTreeItemKeydown = (
  event: KeyboardEvent,
  itemIndex: number,
  totalItems: number,
) => {
  const key = event.key;
  if (
    !(
      (key === "ArrowDown" && itemIndex === totalItems - 1) ||
      (key === "ArrowUp" && itemIndex === 0)
    )
  ) {
    return;
  }

  const currentItem = event.currentTarget as HTMLElement | null;
  if (!currentItem) return;

  if (
    moveFocusToNearestOrbatNavTarget(currentItem, key === "ArrowDown" ? "down" : "up")
  ) {
    event.preventDefault();
  }
};

const expandedKeys = ref<EntityId[]>([]);
const expandableUnitsById = ref(new Map<EntityId, NUnit>());
let previousExpandedSet = new Set<EntityId>();
const { orbatRevealUnitId } = useSelectedItems();
const orbatIconSize = useLocalStorage("orbatIconSize", 20);
const treeViewportRef = ref<HTMLElement | null>(null);

function collectExpandedKeys(items: NOrbatItemData[]): EntityId[] {
  const keys: EntityId[] = [];
  const walk = (nodes: NOrbatItemData[]) => {
    for (const node of nodes) {
      if (node.children.length && node.unit._isOpen) {
        keys.push(node.unit.id);
      }
      if (node.children.length) {
        walk(node.children);
      }
    }
  };
  walk(items);
  return keys;
}

function collectExpandableUnits(items: NOrbatItemData[]): Map<EntityId, NUnit> {
  const units = new Map<EntityId, NUnit>();
  const walk = (nodes: NOrbatItemData[]) => {
    for (const node of nodes) {
      if (node.children.length) {
        units.set(node.unit.id, node.unit);
        walk(node.children);
      }
    }
  };
  walk(items);
  return units;
}

function syncOpenStateFromExpanded(nextExpanded: Set<EntityId>, forceFull = false) {
  const units = expandableUnitsById.value;
  if (forceFull) {
    for (const [id, unit] of units) {
      unit._isOpen = nextExpanded.has(id);
    }
    previousExpandedSet = new Set(nextExpanded);
    return;
  }

  for (const id of nextExpanded) {
    if (!previousExpandedSet.has(id)) {
      const unit = units.get(id);
      if (unit) unit._isOpen = true;
    }
  }

  for (const id of previousExpandedSet) {
    if (!nextExpanded.has(id)) {
      const unit = units.get(id);
      if (unit) unit._isOpen = false;
    }
  }

  previousExpandedSet = new Set(nextExpanded);
}

function setExpanded(unitId: EntityId, value: boolean) {
  const next = new Set(expandedKeys.value);
  if (value) {
    next.add(unitId);
  } else {
    next.delete(unitId);
  }
  expandedKeys.value = [...next];
}

function isUnitInCurrentTree(unitId: EntityId): boolean {
  const roots = new Set(props.units);
  let current = props.unitMap[unitId];
  while (current) {
    if (roots.has(current.id)) return true;
    current = props.unitMap[current._pid];
  }
  return false;
}

function getAncestorIdsInCurrentTree(unitId: EntityId): EntityId[] {
  const roots = new Set(props.units);
  const ancestors: EntityId[] = [];
  let current = props.unitMap[unitId];
  while (current && !roots.has(current.id)) {
    const parent = props.unitMap[current._pid];
    if (!parent) break;
    ancestors.push(parent.id);
    current = parent;
  }
  return ancestors;
}

function expandPathToUnit(unitId: EntityId): boolean {
  if (!isUnitInCurrentTree(unitId)) return false;
  const ancestors = getAncestorIdsInCurrentTree(unitId);
  if (!ancestors.length) return true;
  const next = new Set(expandedKeys.value);
  for (const id of ancestors) {
    next.add(id);
  }
  expandedKeys.value = [...next];
  return true;
}

function scrollToUnitWhenReady(unitId: EntityId, attempt = 0) {
  const el = document.getElementById(`ou-${unitId}`);
  if (el) {
    el.scrollIntoView({ block: "center" });
    return;
  }
  if (attempt >= 10) return;
  window.setTimeout(() => {
    void nextTick(() => {
      scrollToUnitWhenReady(unitId, attempt + 1);
    });
  }, 16);
}

function expandSubtree(unitId: EntityId) {
  if (!isUnitInCurrentTree(unitId)) return;
  const next = new Set(expandedKeys.value);
  const stack = [unitId];
  while (stack.length) {
    const id = stack.pop()!;
    const unit = props.unitMap[id];
    if (!unit?.subUnits?.length) continue;
    next.add(id);
    for (const childId of unit.subUnits) {
      if (props.unitMap[childId]) stack.push(childId);
    }
  }
  expandedKeys.value = [...next];
}

function collapseSubtree(unitId: EntityId) {
  if (!isUnitInCurrentTree(unitId)) return;
  const next = new Set(expandedKeys.value);
  const stack = [unitId];
  while (stack.length) {
    const id = stack.pop()!;
    const unit = props.unitMap[id];
    if (!unit?.subUnits?.length) continue;
    next.delete(id);
    for (const childId of unit.subUnits) {
      if (props.unitMap[childId]) stack.push(childId);
    }
  }
  expandedKeys.value = [...next];
}

function hasSameKeys(a: EntityId[], b: EntityId[]) {
  if (a.length !== b.length) return false;
  const setA = new Set(a);
  for (const key of b) {
    if (!setA.has(key)) return false;
  }
  return true;
}

function getTreeKey(item: unknown): EntityId | "" {
  if (item && typeof item === "object" && "unit" in item) {
    const unit = (item as { unit?: { id?: EntityId } }).unit;
    return unit?.id ?? "";
  }
  return "";
}

function getTreeChildren(item: NOrbatItemData): NOrbatItemData[] | undefined {
  return item.children.length ? item.children : undefined;
}

const filteredUnits = ref<NOrbatItemData[]>([]);

watch(
  [() => props.units, () => props.unitMap, () => props.filterQuery, () => props.locationFilter],
  ([units, unitMap, filterQuery, locationFilter], oldValues) => {
    const [, , oldFilterQuery] = oldValues || [];
    const resetOpen = filterQuery !== oldFilterQuery;
    filteredUnits.value = filterUnits(
      units,
      unitMap,
      filterQuery,
      locationFilter,
      resetOpen,
    );
  },
  { immediate: true },
);

const lastInGroupMap = computed(() => {
  const map = new Map<EntityId, boolean>();
  const walk = (nodes: NOrbatItemData[]) => {
    for (let i = 0; i < nodes.length; i += 1) {
      const node = nodes[i];
      map.set(node.unit.id, i === nodes.length - 1);
      if (node.children.length) {
        walk(node.children);
      }
    }
  };
  walk(filteredUnits.value);
  return map;
});

const visibleFlattenedUnitIds = computed(() =>
  flattenVisibleTreeIds(filteredUnits.value, expandedKeys.value),
);

const visibleItemCount = computed(() => visibleFlattenedUnitIds.value.length);

const isVirtualized = computed(() =>
  shouldVirtualizeTree(visibleItemCount.value, props.virtualizationThreshold),
);

const resolvedVirtualEstimateSize = computed(() => {
  if (typeof props.virtualEstimateSize === "number") return props.virtualEstimateSize;
  const symbolSizePx = orbatIconSize.value * (4 / 3);
  return Math.max(32, Math.ceil(symbolSizePx + 12));
});

function getFocusedTreeUnitId(): EntityId | null {
  const active = document.activeElement as HTMLElement | null;
  if (!active?.id?.startsWith("ou-")) return null;
  return active.id.slice(3);
}

function restoreFocusToUnit(unitId: EntityId | null) {
  if (!unitId) return;
  const el = document.getElementById(`ou-${unitId}`);
  if (el instanceof HTMLElement) {
    el.focus();
  }
}

function getVirtualTextContent(item: Record<string, unknown>) {
  const value = item as unknown as NOrbatItemData;
  const text = value.unit.shortName || value.unit.name || "";
  return text.toLowerCase();
}

function toOrbatItemData(item: Record<string, any>): NOrbatItemData {
  return item as unknown as NOrbatItemData;
}

function preScrollVirtualizedTree(unitId: EntityId) {
  if (!isVirtualized.value) return;
  const viewport = treeViewportRef.value;
  if (!viewport) return;

  const index = getVisibleTreeIndexByUnitId(visibleFlattenedUnitIds.value, unitId);
  if (index < 0) return;

  const targetTop =
    index * resolvedVirtualEstimateSize.value -
    viewport.clientHeight / 2 +
    resolvedVirtualEstimateSize.value / 2;
  viewport.scrollTop = Math.max(0, targetTop);
}

watch(isVirtualized, (next, prev) => {
  if (next === prev) return;
  const focusedUnitId = getFocusedTreeUnitId();
  void nextTick(() => {
    restoreFocusToUnit(focusedUnitId);
  });
});

watch(
  filteredUnits,
  (items) => {
    expandableUnitsById.value = collectExpandableUnits(items);

    const externalExpandedKeys = collectExpandedKeys(items);
    if (!hasSameKeys(externalExpandedKeys, expandedKeys.value)) {
      expandedKeys.value = externalExpandedKeys;
    }

    syncOpenStateFromExpanded(new Set(expandedKeys.value), true);
  },
  { immediate: true },
);

watch(
  () => expandedKeys.value.slice(),
  (keys) => {
    syncOpenStateFromExpanded(new Set(keys));
  },
);

watch(
  orbatRevealUnitId,
  (unitId) => {
    if (!unitId) return;
    if (!expandPathToUnit(unitId)) return;
    orbatRevealUnitId.value = null;
    void nextTick(() => {
      preScrollVirtualizedTree(unitId);
      scrollToUnitWhenReady(unitId);
    });
  },
  { immediate: true },
);
</script>

<template>
  <TreeRoot
    v-slot="{ flattenItems }"
    as="div"
    :items="filteredUnits"
    :get-key="getTreeKey"
    :get-children="getTreeChildren"
    v-model:expanded="expandedKeys"
    class="select-none"
    data-orbat-nav="tree-root"
  >
    <div v-if="isVirtualized" ref="treeViewportRef" :class="virtualViewportClass">
      <TreeVirtualizer
        :estimate-size="resolvedVirtualEstimateSize"
        :overscan="virtualOverscan"
        :text-content="getVirtualTextContent"
        v-slot="{ item: flattenItem, virtualItem }"
      >
        <TreeItem
          as="div"
          v-slot="{ isExpanded, handleToggle }"
          :key="flattenItem._id"
          v-bind="flattenItem.bind"
          :id="`ou-${flattenItem.value.unit.id}`"
          :style="{ paddingLeft: `${(flattenItem.level - 1) * 1.5}rem` }"
          class="group/orbat-item focus-visible:ring-ring block w-full focus-visible:ring-1 focus-visible:outline-none focus-visible:ring-inset"
          @toggle="
            (event) => {
              if (event.detail?.originalEvent?.type === 'click') event.preventDefault();
            }
          "
          @select="onTreeItemSelect(toOrbatItemData(flattenItem.value), $event)"
          @keydown="onTreeItemKeydown($event, virtualItem.index, flattenItems.length)"
        >
          <OrbatTreeItem
            :item="toOrbatItemData(flattenItem.value)"
            :symbolOptions="symbolOptions"
            :level="flattenItem.level - 1"
            :is-expanded="isExpanded"
            :has-children="flattenItem.hasChildren"
            :last-in-group="lastInGroupMap.get(flattenItem.value.unit.id) ?? true"
            :on-toggle="handleToggle"
            :on-set-expanded="(value) => setExpanded(flattenItem.value.unit.id, value)"
            @unit-action="onUnitAction"
            @unit-click="(unit, event) => emit('unit-click', unit, event)"
          />
        </TreeItem>
      </TreeVirtualizer>
    </div>
    <template v-else>
      <TreeItem
        v-for="(flattenItem, index) in flattenItems"
        as="div"
        v-slot="{ isExpanded, handleToggle }"
        :key="flattenItem._id"
        v-bind="flattenItem.bind"
        :id="`ou-${flattenItem.value.unit.id}`"
        :style="{ paddingLeft: `${(flattenItem.level - 1) * 1.5}rem` }"
        class="group/orbat-item focus-visible:ring-ring block w-full focus-visible:ring-1 focus-visible:outline-none focus-visible:ring-inset"
        @toggle="
          (event) => {
            if (event.detail?.originalEvent?.type === 'click') event.preventDefault();
          }
        "
        @select="onTreeItemSelect(flattenItem.value, $event)"
        @keydown="onTreeItemKeydown($event, index, flattenItems.length)"
      >
        <OrbatTreeItem
          :item="flattenItem.value"
          :symbolOptions="symbolOptions"
          :level="flattenItem.level - 1"
          :is-expanded="isExpanded"
          :has-children="flattenItem.hasChildren"
          :last-in-group="lastInGroupMap.get(flattenItem.value.unit.id) ?? true"
          :on-toggle="handleToggle"
          :on-set-expanded="(value) => setExpanded(flattenItem.value.unit.id, value)"
          @unit-action="onUnitAction"
          @unit-click="(unit, event) => emit('unit-click', unit, event)"
        />
      </TreeItem>
    </template>
  </TreeRoot>
</template>
