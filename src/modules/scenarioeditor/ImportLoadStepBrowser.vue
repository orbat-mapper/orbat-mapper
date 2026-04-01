<script setup lang="ts">
import StoredScenarioBrowser from "@/components/StoredScenarioBrowser.vue";
import { useBrowserScenarios } from "@/composables/browserScenarios";
import { type StoredScenarioAction } from "@/types/constants";
import { type ScenarioMetadata } from "@/scenariostore/localdb";

const emit = defineEmits(["loaded"]);
const {
  importScenario,
  storedScenarios,
  sortOptions,
  sortDirection,
  toggleSortDirection,
  onAction,
  onBulkAction,
} = useBrowserScenarios();

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
  <section class="px-6 pb-6">
    <StoredScenarioBrowser
      :scenarios="storedScenarios"
      :sort-options="sortOptions"
      :sort-direction="sortDirection"
      search-input-id="import-scenario-search"
      no-link
      enable-batch-actions
      empty-message="No recent scenarios match"
      grid-class="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-3"
      @action="handleAction"
      @bulk-action="onBulkAction"
      @toggle-sort-direction="toggleSortDirection"
    />
  </section>
</template>
