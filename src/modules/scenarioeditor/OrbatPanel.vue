<template>
  <div class="space-y-4">
    <slot name="header"></slot>
    <OrbatSide
      v-for="side in sides"
      :key="side.id"
      :side="side"
      @unit-action="onUnitAction"
      @unit-click="onUnitClick"
      @unit-drop="onUnitDrop"
      @side-action="onSideAction"
      :hide-filter="hideFilter"
    />
    <OrbatPanelAddSide
      v-if="sides.length < 2"
      :simple="sides.length >= 1"
      class="mt-8"
      @add="addSide()"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import OrbatPanelAddSide from "@/components/OrbatPanelAddSide.vue";
import { injectStrict } from "@/utils";
import { activeParentKey, activeScenarioKey, activeUnitKey } from "@/components/injects";
import OrbatSide from "@/components/OrbatSide.vue";
import { NSide, NSideGroup, NUnit } from "@/types/internalModels";
import { SideAction, SideActions } from "@/types/constants";
import { DropTarget } from "@/components/types";
import { useUnitActions } from "@/composables/scenarioActions";
import { useEventBus } from "@vueuse/core";
import { orbatUnitClick } from "@/components/eventKeys";
import { useSelectedItems } from "@/stores/selectedStore";

interface Props {
  hideFilter?: boolean;
}

const props = withDefaults(defineProps<Props>(), { hideFilter: false });
const activeScenario = injectStrict(activeScenarioKey);
const { store, unitActions } = activeScenario;
const activeUnitId = injectStrict(activeUnitKey);
const activeParentId = injectStrict(activeParentKey);

const { state } = store;
const { changeUnitParent, addSide } = unitActions;
const bus = useEventBus(orbatUnitClick);

const sides = computed(() => {
  return state.sides.map((id) => state.sideMap[id]);
});

const { onUnitAction } = useUnitActions();
const { selectedUnitIds } = useSelectedItems();

function onUnitDrop(
  unit: NUnit,
  destinationUnit: NUnit | NSideGroup,
  target: DropTarget
) {
  changeUnitParent(unit.id, destinationUnit.id, target);
}

function onUnitClick(unit: NUnit, event: MouseEvent) {
  const ids = selectedUnitIds.value;
  if (event.shiftKey) {
    if (ids.has(unit.id)) {
      ids.delete(unit.id);
    } else {
      ids.add(unit.id);
    }
  } else {
    activeUnitId.value = unit.id;
    selectedUnitIds.value = new Set(activeUnitId.value ? [unit.id] : []);
    activeParentId.value = unit.id;
  }
  bus.emit(unit);
}

watch(
  () => selectedUnitIds.value,
  (v) => {
    if (v.size === 1) activeUnitId.value = [...selectedUnitIds.value.values()].pop();
    if (v.size === 0) activeUnitId.value = null;
  },
  { deep: true }
);

function onSideAction(side: NSide, action: SideAction) {
  if (action === SideActions.Delete) {
    unitActions.deleteSide(side.id);
  } else if (action === SideActions.MoveDown) {
    unitActions.reorderSide(side.id, "down");
  } else if (action === SideActions.MoveUp) {
    unitActions.reorderSide(side.id, "up");
  }
}
</script>
