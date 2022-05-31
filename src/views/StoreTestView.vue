<script setup lang="ts">
import { useFetch } from "@vueuse/core";
import { GlobalEvents } from "vue-global-events";
import { Scenario, Unit } from "../types/scenarioModels";
import { NUnit, useNewScenarioStore } from "../stores/newScenarioStore";
import BaseButton from "../components/BaseButton.vue";
import OrbatTree from "../components/OrbatTree.vue";
import { computed, toRaw } from "vue";
import { EntityId } from "../types/base";
import { klona } from "klona";

const { data } = await useFetch<Scenario>("/scenarios/falkland82.json").get().json();
const { store, deleteUnit } = useNewScenarioStore(data.value);

const { state, update, undo, redo, canRedo, canUndo } = store;
update((currentState) => {
  currentState.unitMap["ZcsBI6kKkDawpUEn3j9VJ"].name = "JALLA";
});

function mutate1() {
  deleteUnit("mFFoHYTQvBP_MJIJ9Trlb");
  deleteUnit("ZcsBI6kKkDawpUEn3j9VJ");
}

function buildHierarchy(rootUnitId: EntityId) {
  const rootUnit = state.unitMap[rootUnitId];
  const nUnit = { ...rootUnit, subUnits: [] };
  function helper(unitId: EntityId, parent: typeof nUnit) {
    const unit = state.unitMap[unitId];

    if (!unit) return;
    const nUnit = { ...unit, subUnits: [] };

    for (const subUnitId of unit.subUnits) {
      helper(subUnitId, nUnit);
    }
    parent.subUnits.push(nUnit);
  }
  for (const unitId of rootUnit.subUnits) {
    helper(unitId, nUnit);
  }
  return nUnit;
}

interface IdUnit {
  id: EntityId;
  subUnits: IdUnit[];
}

function buildIdHierarchy(rootUnitId: EntityId) {
  const rootUnit = state.unitMap[rootUnitId];
  const nUnit: IdUnit = { id: rootUnitId, subUnits: [] };
  function helper(unitId: EntityId, parent: IdUnit) {
    const unit = state.unitMap[unitId];

    if (!unit) return;
    const nUnit: IdUnit = { id: unitId, subUnits: [] };

    for (const subUnitId of unit.subUnits) {
      helper(subUnitId, nUnit);
    }
    parent.subUnits.push(nUnit);
  }
  for (const unitId of rootUnit.subUnits) {
    helper(unitId, nUnit);
  }
  return nUnit;
}

const units = computed(() => {
  console.log("yo");

  return Object.values(state.sideGroupMap)
    .map((g) => g.units)
    .flat()
    .map((id) => buildHierarchy(id));
});

console.log(buildIdHierarchy("yeyNm2QTCh_yivrfpnv0N"));
</script>
<template>
  <main class="p-8">
    <header class="prose">
      <h1>Scenario store experiments</h1>

      <div class="flex items-center space-x-2">
        <BaseButton @click="mutate1()">Mutate</BaseButton>
        <BaseButton :disabled="!canUndo" @click="undo()">Undo</BaseButton>
        <BaseButton :disabled="!canRedo" @click="redo()">Redo</BaseButton>
      </div>
    </header>
    <section class="mt-4 grid grid-cols-2 gap-4">
      <div class="prose">
        <pre>{{ state }}</pre>
      </div>
      <div>
        <OrbatTree :units="units" />
        <pre>{{ units }}</pre>
      </div>
    </section>
    <GlobalEvents
      @keyup.ctrl.z.exact="undo()"
      @keyup.ctrl.shift.z="redo()"
      @keyup.ctrl.y="redo()"
    />
  </main>
</template>
