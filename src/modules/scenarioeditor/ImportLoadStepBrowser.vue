<script setup lang="ts">
import { useBrowserScenarios } from "@/composables/browserScenarios";
import SortDropdown from "@/components/SortDropdown.vue";
import ScenarioLinkCard from "@/components/ScenarioLinkCard.vue";
import { type StoredScenarioAction } from "@/types/constants";
import { type ScenarioMetadata } from "@/scenariostore/localdb";
const emit = defineEmits(["loaded"]);
const { importScenario, storedScenarios, sortOptions, onAction } = useBrowserScenarios();

async function handleAction(action: StoredScenarioAction, info: ScenarioMetadata) {
  if (action === "open") {
    const scenario = await importScenario(info.id);
    if (scenario) emit("loaded", scenario);
  } else {
    await onAction(action, info);
  }
}
</script>

<template>
  <section class="">
    <header class="flex items-center justify-end border-b border-gray-200 px-6 pb-5">
      <div class="mt-3 flex items-center sm:mt-0 sm:ml-4">
        <SortDropdown class="mr-4" :options="sortOptions" />
      </div>
    </header>
    <ul class="grid grid-cols-1 gap-6 p-6 sm:grid-cols-3">
      <ScenarioLinkCard
        no-link
        v-for="info in storedScenarios"
        :key="info.id"
        :data="info"
        @action="handleAction($event, info)"
      />
    </ul>
  </section>
</template>
