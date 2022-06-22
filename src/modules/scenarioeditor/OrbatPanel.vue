<template>
  <div>
    <p class="pl-6 pr-2 text-xs font-medium uppercase tracking-wider text-gray-500">
      Order of battle
    </p>
    <NOrbatSide
      v-for="side in sides"
      :key="side.id"
      :side="side"
      :state="state"
      @unit-action="onUnitAction"
      @unit-click="onUnitClick"
      @unit-drop="onUnitDrop"
      @side-action="onSideAction"
      class="mt-4"
    />
    <OrbatPanelAddSide v-if="showAdd" class="mt-8" @add="addSide()" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import OrbatPanelAddSide from "@/components/OrbatPanelAddSide.vue";
import { injectStrict } from "@/utils";
import { activeScenarioKey, activeUnitKey } from "@/components/injects";
import NOrbatSide from "@/components/NOrbatSide.vue";
import { NSide, NSideGroup, NUnit } from "@/types/internalModels";
import { SideActions, UnitActions } from "@/types/constants";
import { DropTarget } from "@/components/types";

const { store, unitActions } = injectStrict(activeScenarioKey);
const activeUnitId = injectStrict(activeUnitKey);

const { state } = store;
const {
  deleteUnit,
  walkSubUnits,
  cloneUnit,
  changeUnitParent,
  createSubordinateUnit,
  addSide,
} = unitActions;

const sides = computed(() => {
  return state.sides.map((id) => state.sideMap[id]);
});
const showAdd = computed(() => sides.value.length < 2);

function onUnitAction(unit: NUnit, action: UnitActions) {
  console.log("On action", unit.name, action);
  if (action === UnitActions.Delete) deleteUnit(unit.id);
  if (action === UnitActions.Expand) {
    walkSubUnits(
      unit.id,
      (unit1) => {
        unit1._isOpen = true;
      },
      { includeParent: true }
    );
  }
  if (action === UnitActions.Clone) cloneUnit(unit.id);
  if (action === UnitActions.AddSubordinate) createSubordinateUnit(unit.id);
  if (action === UnitActions.MoveUp) unitActions.reorderUnit(unit.id, "up");
  if (action === UnitActions.MoveDown) unitActions.reorderUnit(unit.id, "down");
}

function onUnitDrop(
  unit: NUnit,
  destinationUnit: NUnit | NSideGroup,
  target: DropTarget
) {
  changeUnitParent(unit.id, destinationUnit.id, target);
}

function onUnitClick(unit: NUnit) {
  console.log("On unit click", unit.name);
  activeUnitId.value = unit.id;
}

function onSideAction(side: NSide, action: SideActions) {
  if (action === SideActions.Delete) {
    unitActions.deleteSide(side.id);
  }
}
</script>
