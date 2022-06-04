<script setup lang="ts">
import { computed, PropType } from "vue";
import OrbatTreeItem from "./OrbatTreeItem.vue";
import { OrbatItemData, Unit } from "../types/scenarioModels";
import { useExpandTree } from "./helpers";
import { UnitActions } from "../types/constants";

const props = defineProps({
  units: { type: Array as PropType<Unit[]>, required: true },
  filterQuery: { type: String as PropType<string>, default: "" },
  locationFilter: { type: Boolean as PropType<boolean>, default: false },
});

const emit = defineEmits(["unit-action"]);

const { setItemRef, expandChildren } = useExpandTree();
const onUnitAction = (unit: Unit, action: UnitActions) => {
  emit("unit-action", unit, action);
};
defineExpose({ expandChildren });

const filteredUnits = computed(() =>
  filterUnits(props.units, props.filterQuery, props.locationFilter)
);

function filterUnits(
  units: Unit[],
  query: string = "",
  locationFilter = false
): OrbatItemData[] {
  let filteredUnits: OrbatItemData[] = [];
  let re = new RegExp(query, "i");

  function helper(currentUnit: Unit, parentMatched: boolean) {
    let oi: OrbatItemData = {
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

  for (const unit of units) {
    filteredUnits.push(...helper(unit, false));
  }
  return filteredUnits;
}
</script>

<template>
  <ul class="space-y-1">
    <OrbatTreeItem
      :item="orbatItem"
      v-for="orbatItem in filteredUnits"
      :key="orbatItem.unit.id"
      :ref="setItemRef"
      @action="onUnitAction"
    />
  </ul>
</template>
