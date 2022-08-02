<template>
  <div>
    <p class="pl-6 pr-2 text-xs font-medium uppercase tracking-wider text-gray-500">
      Order of battle
    </p>
    <OrbatSide
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
import OrbatSide from "@/components/OrbatSide.vue";
import { NSide, NSideGroup, NUnit } from "@/types/internalModels";
import { SideActions } from "@/types/constants";
import { DropTarget } from "@/components/types";
import { useUnitActionsN } from "@/composables/scenarioActions";
import { useSelectedUnits } from "@/stores/dragStore";

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
const { selectedUnitIds } = useSelectedUnits();

function onUnitDrop(
  unit: NUnit,
  destinationUnit: NUnit | NSideGroup,
  target: DropTarget
) {
  changeUnitParent(unit.id, destinationUnit.id, target);
}

function onUnitClick(unit: NUnit, event: MouseEvent) {
  if (event.shiftKey) {
    if (selectedUnitIds.value.has(unit.id)) {
      selectedUnitIds.value.delete(unit.id);
    } else {
      selectedUnitIds.value.add(unit.id);
    }
    if (selectedUnitIds.value.size === 1) {
      activeUnitId.value = unit.id;
    }
  } else {
    activeUnitId.value = activeUnitId.value === unit.id ? null : unit.id;
    selectedUnitIds.value = new Set(activeUnitId.value ? [unit.id] : []);
  }
}

function onSideAction(side: NSide, action: SideActions) {
  if (action === SideActions.Delete) {
    unitActions.deleteSide(side.id);
  } else if (action === SideActions.MoveDown) {
    unitActions.reorderSide(side.id, "down");
  } else if (action === SideActions.MoveUp) {
    unitActions.reorderSide(side.id, "up");
  }
}
</script>
