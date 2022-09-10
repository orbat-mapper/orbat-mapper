<script setup lang="ts">
import { useDark, useToggle } from "@vueuse/core";
import { GlobalEvents } from "vue-global-events";
import { MoonIcon, SunIcon } from "@heroicons/vue/24/solid";
import BaseButton from "@/components/BaseButton.vue";
import { computed, onMounted, provide, ref } from "vue";
import { EntityId } from "@/types/base";
import { inputEventFilter } from "@/components/helpers";
import { SideActions, UnitActions } from "@/types/constants";
import { DropTarget } from "@/components/types";
import { NSide, NSideGroup, NUnit } from "@/types/internalModels";
import { activeScenarioKey, activeUnitKey } from "@/components/injects";
import NOrbatSide from "@/components/OrbatSide.vue";
import { TScenario } from "@/scenariostore";

const props = defineProps<{ activeScenario: TScenario }>();

const { store, unitActions, time, io, geo } = props.activeScenario;
const { deleteUnit, walkSubUnits, changeUnitParent, cloneUnit } = unitActions;
const { state, update, undo, redo, canRedo, canUndo } = store!;
const { utcTime, scenarioTime, timeZone } = time;

const { onUndoRedo } = store;

onUndoRedo((data) => {
  console.log("On undo/redo", data);
});

const activeUnitId = ref<EntityId | undefined>();

provide(activeUnitKey, activeUnitId);
provide(activeScenarioKey, props.activeScenario);

const isDark = useDark();

const sides = computed(() => {
  return state.sides.map((id) => state.sideMap[id]);
});

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
  if (action === UnitActions.MoveUp) unitActions.reorderUnit(unit.id, "up");
  if (action === UnitActions.MoveDown) unitActions.reorderUnit(unit.id, "down");
}

function onUnitDrop(
  unit: NUnit,
  destinationUnit: NUnit | NSideGroup,
  target: DropTarget
) {
  console.log(`Unit ${unit.name} was dropped ${target} ${destinationUnit.name}`);

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

const toggleDark = useToggle(isDark);

onMounted(() => {
  console.log("Mounted");
});
</script>
<template>
  <main class="dark:text bg-white p-4 text-gray-700 dark:bg-gray-900 dark:text-gray-400">
    <header class="prose dark:prose-invert">
      <h1>Scenario store experiments</h1>
      <p class="-mt-6">
        Working on a new scenario store with undo and redo functionality.
      </p>
    </header>
    <div class="mt-4 flex items-center space-x-2">
      <BaseButton :disabled="!canUndo" @click="undo()">Undo</BaseButton>
      <BaseButton :disabled="!canRedo" @click="redo()">Redo</BaseButton>
      <BaseButton @click="unitActions.addSide()">Add side</BaseButton>
      <BaseButton @click="toggleDark()"
        ><span class="mr-1 h-4 w-4"><MoonIcon v-if="isDark" /><SunIcon v-else /></span
        >Toggle
      </BaseButton>
      <BaseButton @click="io.loadEmptyScenario()">Load empty</BaseButton>
      <BaseButton @click="io.loadDemoScenario('falkland82')">Load demo</BaseButton>
      <BaseButton @click="time.add(1, 'day')">+1 day</BaseButton>
      <BaseButton @click="time.subtract(1, 'day')">-1 day</BaseButton>
      <span>{{ scenarioTime.format("YYYY-MM-DDTHH:mmZ") }}</span>
    </div>
    <section class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div class="max-w-md">
        <NOrbatSide
          v-for="side in sides"
          :key="side.id"
          :side="side"
          :state="state"
          @unit-action="onUnitAction"
          @unit-click="onUnitClick"
          @unit-drop="onUnitDrop"
          @side-action="onSideAction"
        />
      </div>
      <div class="prose">
        <pre>{{ geo.layers }}</pre>
        <pre>{{ store.state }}</pre>
      </div>
    </section>
    <GlobalEvents
      :filter="inputEventFilter"
      @keyup.ctrl.z.exact="undo()"
      @keyup.ctrl.shift.z="redo()"
      @keyup.ctrl.y="redo()"
    />
  </main>
</template>
