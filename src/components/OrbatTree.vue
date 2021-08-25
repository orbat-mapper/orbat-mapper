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

<script lang="ts">
import { computed, defineComponent, PropType } from "vue";
import OrbatTreeItem from "./OrbatTreeItem.vue";
import { OrbatItemData, Unit } from "../types/models";
import { useExpandTree } from "./helpers";
import { UnitActions } from "../types/constants";

export default defineComponent({
  name: "OrbatTree",
  props: {
    units: { type: Array as PropType<Unit[]>, required: true },
    filterQuery: { type: String as PropType<string>, default: "" },
    locationFilter: { type: Boolean as PropType<boolean>, default: false },
  },
  emits: ["unit-action"],
  components: { OrbatTreeItem },
  setup(props, { emit }) {
    const { setItemRef, expandChildren } = useExpandTree();
    const onUnitAction = (unit: Unit, action: UnitActions) => {
      emit("unit-action", unit, action);
    };

    const filteredUnits = computed(() =>
      filterUnits(props.units, props.filterQuery, props.locationFilter)
    );

    return { setItemRef, expandChildren, onUnitAction, filteredUnits };
  },
});

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
    oi.unit._isOpen = !!query;
    let matched = false;
    let childMatched = false;
    const hasPosition = Boolean(currentUnit?._state?.coordinates);
    let children = [];
    if (currentUnit.name.search(re) >= 0) {
      matched = locationFilter ? hasPosition : true;
      oi.unit._isOpen = !!query;
    } else if (parentMatched) {
      oi.unit._isOpen = false;
    }
    if (currentUnit.subUnits) {
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
