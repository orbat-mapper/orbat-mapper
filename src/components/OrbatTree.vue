<script setup lang="ts">
import { computed, ref, watch } from "vue";
import OrbatTreeItem from "./OrbatTreeItem.vue";
import { UnitActions } from "@/types/constants";
import { EntityId } from "@/types/base";
import type { DropTarget } from "./types";
import type { NUnit } from "@/types/internalModels";
import { filterUnits } from "@/composables/filtering";

interface Props {
  units: EntityId[];
  unitMap: Record<EntityId, NUnit>;
  filterQuery?: string;
  locationFilter?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  filterQuery: "",
  locationFilter: false,
});

interface Emits {
  (e: "unit-action", unit: NUnit, action: UnitActions): void;
  (e: "unit-click", unit: NUnit, event: MouseEvent): void;
  (e: "unit-drop", unit: NUnit, destinationUnit: NUnit, target: DropTarget): void;
}
const emit = defineEmits<Emits>();

const queryHasChanged = ref(true);

watch(
  () => props.filterQuery,
  () => (queryHasChanged.value = true)
);

const onUnitAction = (unit: NUnit, action: UnitActions) => {
  emit("unit-action", unit, action);
};

const onUnitDrop = (unit: NUnit, destinationUnit: NUnit, target: DropTarget) =>
  emit("unit-drop", unit, destinationUnit, target);

const filteredUnits = computed(() => {
  const resetOpen = queryHasChanged.value;
  queryHasChanged.value = false;
  return filterUnits(
    props.units,
    props.unitMap,
    props.filterQuery,
    props.locationFilter,
    resetOpen
  );
});
</script>

<template>
  <ul class="space-y-1">
    <OrbatTreeItem
      :item="orbatItem"
      v-for="orbatItem in filteredUnits"
      :key="orbatItem.unit.id"
      @unit-action="onUnitAction"
      @unit-click="(unit, event) => emit('unit-click', unit, event)"
      @unit-drop="onUnitDrop"
    />
  </ul>
</template>
