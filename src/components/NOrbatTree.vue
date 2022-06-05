<script setup lang="ts">
import { computed, provide } from "vue";
import NOrbatTreeItem from "./NOrbatTreeItem.vue";
import { UnitActions } from "../types/constants";
import { EntityId } from "../types/base";
import { NUnit } from "../stores/newScenarioStore";
import { activeUnitKey } from "./injects";
import { DropTarget } from "./types";

interface Props {
  units: EntityId[];
  unitMap: Record<EntityId, NUnit>;
  filterQuery?: string;
  locationFilter?: boolean;
  activeUnitId?: EntityId;
}

const props = withDefaults(defineProps<Props>(), {
  filterQuery: "",
  locationFilter: false,
});

provide(
  activeUnitKey,
  computed(() => props.activeUnitId)
);

interface Emits {
  (e: "unit-action", unit: NUnit, action: UnitActions): void;
  (e: "unit-click", unit: NUnit): void;
  (e: "unit-drop", unit: NUnit, destinationUnit: NUnit, target: DropTarget): void;
}
const emit = defineEmits<Emits>();

const onUnitAction = (unit: NUnit, action: UnitActions) => {
  emit("unit-action", unit, action);
};

const onUnitDrop = (unit: NUnit, destinationUnit: NUnit, target: DropTarget) =>
  emit("unit-drop", unit, destinationUnit, target);

const filteredUnits = computed(() =>
  filterUnits(props.units, props.filterQuery, props.locationFilter)
);

interface NOrbatItemData {
  unit: NUnit;
  children: NOrbatItemData[];
}

function filterUnits(
  units: EntityId[],
  query: string = "",
  locationFilter = false
): NOrbatItemData[] {
  let filteredUnits: NOrbatItemData[] = [];
  let re = new RegExp(query, "i");

  function helper(currentUnitId: EntityId, parentMatched: boolean) {
    const currentUnit = props.unitMap[currentUnitId] as NUnit;
    let oi: NOrbatItemData = {
      unit: currentUnit,
      children: [],
    };
    if (query) oi.unit._isOpen = true;
    let matched = false;
    let childMatched = false;
    const hasPosition = Boolean(currentUnit?._state?.location);
    let children = [];
    if (currentUnit.name.search(re) >= 0) {
      matched = locationFilter ? hasPosition : true;
      // oi.unit._isOpen = !!query;
    } else if (parentMatched) {
      oi.unit._isOpen = false;
    }
    if (currentUnit.subUnits?.length) {
      for (const subUnit of currentUnit.subUnits) {
        let su = helper(subUnit, matched || parentMatched);
        if (su.length) {
          childMatched = true;
          oi.children.push(...su);
        }
      }
    }
    if (matched || childMatched || (parentMatched && !locationFilter)) {
      children.push(oi);
    }
    return children;
  }

  for (const unitId of units) {
    filteredUnits.push(...helper(unitId, false));
  }
  return filteredUnits;
}
</script>

<template>
  <ul class="space-y-1">
    <NOrbatTreeItem
      :item="orbatItem"
      v-for="orbatItem in filteredUnits"
      :key="orbatItem.unit.id"
      @action="onUnitAction"
      @unit-click="emit('unit-click', $event)"
      @unit-drop="onUnitDrop"
    />
  </ul>
</template>
