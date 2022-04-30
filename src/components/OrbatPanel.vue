<template>
  <div>
    <p class="pl-6 pr-2 text-xs font-medium uppercase tracking-wider text-gray-500">
      Order of battle
    </p>
    <OrbatSide v-for="side in scenario.sides" :side="side" class="mt-4" />
    <OrbatPanelAddSide v-if="showAdd" class="mt-8" @add="onAdd" />
  </div>
</template>

<script setup lang="ts">
import { computed, toRef } from "vue";
import { useScenarioStore } from "../stores/scenarioStore";

import OrbatSide from "./OrbatSide.vue";
import OrbatPanelAddSide from "./OrbatPanelAddSide.vue";

const scenarioStore = useScenarioStore();
const scenario = toRef(scenarioStore, "scenario");
const showAdd = computed(() => scenarioStore.scenario.sides.length < 2);

const onAdd = () => {
  scenarioStore.addSide();
};
</script>
