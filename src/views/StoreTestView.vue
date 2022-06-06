<script setup lang="ts">
import { useDark, useFetch, useToggle } from "@vueuse/core";
import { GlobalEvents } from "vue-global-events";
import { SunIcon, MoonIcon } from "@heroicons/vue/solid";
import { Scenario } from "../types/scenarioModels";
import { useNewScenarioStore } from "../stores/newScenarioStore";
import BaseButton from "../components/BaseButton.vue";
import OrbatTree from "../components/NOrbatTree.vue";
import { computed, ref } from "vue";
import { EntityId } from "../types/base";
import { inputEventFilter } from "../components/helpers";
import { UnitActions } from "../types/constants";
import { useUnitManipulations } from "../composables/unitManipulations";
import { DropTarget } from "../components/types";
import { NUnit } from "../types/internalModels";

const { data } = await useFetch<Scenario>("/scenarios/falkland82.json").get().json();
const { store } = useNewScenarioStore(data.value);

const { deleteUnit, walkSubUnits, changeUnitParent, cloneUnit } = useUnitManipulations({
  store,
});
const { state, update, undo, redo, canRedo, canUndo } = store;

const activeUnitId = ref<EntityId | undefined>();
const query = ref("");

const isDark = useDark();

const unitIds = computed(() => {
  console.log("compute unitIds");
  return Object.values(state.sideGroupMap)
    .map((g) => g.units)
    .flat();
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
      true
    );
  }
  if (action === UnitActions.Clone) cloneUnit(unit.id);
}
function onUnitDrop(unit: NUnit, destinationUnit: NUnit, target: DropTarget) {
  console.log(`Unit ${unit.name} was dropped ${target} ${destinationUnit.name}`);
  if (target === "on") {
    changeUnitParent(unit.id, destinationUnit.id);
  } else console.log("Not implemented yet");
}

function onUnitClick(unit: NUnit) {
  console.log("On unit click", unit.name);
  activeUnitId.value = unit.id;
}

const toggleDark = useToggle(isDark);
</script>
<template>
  <main class="dark:text bg-white p-4 text-gray-700 dark:bg-gray-900 dark:text-gray-400">
    <header class="prose dark:prose-invert">
      <h1>Scenario store experiments</h1>
      <p class="-mt-6">
        Working on a new scenario store with undo and redo functionality.
      </p>

      <div class="flex items-center space-x-2">
        <BaseButton :disabled="!canUndo" @click="undo()">Undo</BaseButton>
        <BaseButton :disabled="!canRedo" @click="redo()">Redo</BaseButton>
        <BaseButton @click="toggleDark()"
          ><span class="mr-1 h-4 w-4"><MoonIcon v-if="isDark" /><SunIcon v-else /></span
          >Toggle</BaseButton
        >
      </div>
    </header>
    <section class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div class="max-w-md">
        <input v-model="query" class="rounded-md border p-1" />
        <OrbatTree
          :units="unitIds"
          :unit-map="store.state.unitMap"
          :filter-query="query"
          @unit-action="onUnitAction"
          @unit-click="onUnitClick"
          @unit-drop="onUnitDrop"
          :active-unit-id="activeUnitId"
        />
      </div>
      <div class="prose">
        <pre>{{ state }}</pre>
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
