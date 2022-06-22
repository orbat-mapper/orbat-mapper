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
import { useUnitActionsN } from "@/composables/scenarioActions";

const activeScenario = injectStrict(activeScenarioKey);
const { store, unitActions } = activeScenario;
const activeUnitId = injectStrict(activeUnitKey);

const { state } = store;
const { changeUnitParent, addSide } = unitActions;

const sides = computed(() => {
  return state.sides.map((id) => state.sideMap[id]);
});
const showAdd = computed(() => sides.value.length < 2);

const { onUnitAction } = useUnitActionsN();

function onUnitDrop(
  unit: NUnit,
  destinationUnit: NUnit | NSideGroup,
  target: DropTarget
) {
  changeUnitParent(unit.id, destinationUnit.id, target);
}

function onUnitClick(unit: NUnit) {
  activeUnitId.value = activeUnitId.value === unit.id ? null : unit.id;
}

function onSideAction(side: NSide, action: SideActions) {
  if (action === SideActions.Delete) {
    unitActions.deleteSide(side.id);
  }
}
</script>
