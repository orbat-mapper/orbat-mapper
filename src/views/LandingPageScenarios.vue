<script setup lang="ts">
import { useRouter } from "vue-router";

import WipBadge from "../components/WipBadge.vue";
import { MAP_EDIT_MODE_ROUTE, NEW_SCENARIO_ROUTE } from "@/router/names";
import LoadScenarioPanel from "@/modules/scenarioeditor/LoadScenarioPanel.vue";
import LoadScenarioFromUrlPanel from "@/modules/scenarioeditor/LoadScenarioFromUrlPanel.vue";
import ScenarioLinkCard from "@/components/ScenarioLinkCard.vue";
import SortDropdown from "@/components/SortDropdown.vue";
import { DEMO_SCENARIOS, useBrowserScenarios } from "@/composables/browserScenarios";
import { Button } from "@/components/ui/button";
import { defineAsyncComponent, ref } from "vue";
import type { EncryptedScenario, Scenario } from "@/types/scenarioModels";

const DecryptScenarioModal = defineAsyncComponent(
  () => import("@/components/DecryptScenarioModal.vue"),
);

const { storedScenarios, sortOptions, onAction, loadScenario } = useBrowserScenarios();

const router = useRouter();
const getScenarioTo = (scenarioId: string) => {
  return {
    name: MAP_EDIT_MODE_ROUTE,
    params: { scenarioId: `demo-${scenarioId}` },
  };
};

const newScenario = () => {
  router.push({ name: NEW_SCENARIO_ROUTE });
};

const showDecryptModal = ref(false);
const currentEncryptedScenario = ref<EncryptedScenario | null>(null);

function onLoaded(scenario: Scenario | EncryptedScenario) {
  if (scenario.type === "ORBAT-mapper-encrypted") {
    currentEncryptedScenario.value = scenario as EncryptedScenario;
    showDecryptModal.value = true;
    return;
  }
  loadScenario(scenario as Scenario);
}

function onDecrypted(scenario: Scenario) {
  loadScenario(scenario);
  showDecryptModal.value = false;
  currentEncryptedScenario.value = null;
}
</script>

<template>
  <div class="bg-background relative py-5">
    <div class="mx-auto max-w-3xl p-4 text-center">
      <h2 class="text-heading text-3xl font-bold tracking-tight">Scenarios</h2>
    </div>
    <section v-if="storedScenarios.length > 0" class="mx-auto max-w-7xl p-6">
      <header
        class="border-border border-b pb-5 sm:flex sm:items-center sm:justify-between"
      >
        <h2 class="text-foreground text-base leading-6 font-semibold">
          Recent scenarios
        </h2>
        <div class="mt-3 flex items-center gap-1 sm:mt-0 sm:ml-4">
          <SortDropdown :options="sortOptions" />
          <Button as-child>
            <router-link :to="{ name: NEW_SCENARIO_ROUTE }">
              Create new scenario
            </router-link>
          </Button>
        </div>
      </header>
      <ul
        class="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      >
        <ScenarioLinkCard
          v-for="info in storedScenarios"
          :key="info.id"
          :data="info"
          @action="onAction($event, info)"
        />
      </ul>
    </section>
    <section class="mb-2">
      <p
        class="bg-muted/50 text-muted-foreground relative top-0 right-0 left-0 p-4 text-center text-sm"
      >
        Please note that the demo scenarios are incomplete and they are still under
        development.
      </p>
    </section>
    <div class="mx-auto max-w-3xl px-4 text-center">
      <p class="text-muted-foreground text-lg">
        Try one of the bundled demo scenarios or create your own
      </p>
    </div>
    <section class="mx-auto max-w-7xl p-6">
      <ul class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <li
          v-for="scenario in DEMO_SCENARIOS"
          :key="scenario.name"
          class="divide-border bg-card text-card-foreground focus-within:border-primary col-span-1 flex flex-col divide-y overflow-hidden rounded-lg border text-center shadow-sm"
        >
          <router-link
            :to="getScenarioTo(scenario.id)"
            class="flex flex-1 flex-col"
            draggable="false"
          >
            <img
              class="bg-muted mx-auto h-52 w-full shrink-0 object-cover object-top"
              :src="scenario.imageUrl"
              alt=""
              draggable="false"
            />
            <h3 class="text-heading mt-6 text-sm font-medium">
              {{ scenario.name }}
            </h3>
            <dl class="mt-1 flex grow flex-col justify-between p-4">
              <dt class="sr-only">Summary</dt>
              <dd class="text-muted-foreground text-sm">
                {{ scenario.summary }}
              </dd>
            </dl>
          </router-link>
        </li>
        <li class="col-span-1 flex">
          <button
            type="button"
            @click="newScenario"
            class="border-border hover:border-border/80 focus:ring-ring relative block w-full rounded-lg border-2 border-dashed p-12 text-center focus:ring-2 focus:ring-offset-2 focus:outline-hidden"
          >
            <svg
              class="text-muted-foreground mx-auto h-12 w-12"
              xmlns="http://www.w3.org/2000/svg"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 14v20c0 4.418 7.163 8 16 8 1.381 0 2.721-.087 4-.252M8 14c0 4.418 7.163 8 16 8s16-3.582 16-8M8 14c0-4.418 7.163-8 16-8s16 3.582 16 8m0 0v14m0-4c0 4.418-7.163 8-16 8S8 28.418 8 24m32 10v6m0 0v6m0-6h6m-6 0h-6"
              />
            </svg>
            <span class="text-foreground mt-2 block text-sm font-medium">
              Create new scenario
            </span>
          </button>
        </li>
        <li class="col-span-1 flex">
          <LoadScenarioPanel @loaded="onLoaded" />
        </li>
        <li class="col-span-1 flex">
          <LoadScenarioFromUrlPanel @loaded="onLoaded" />
        </li>
      </ul>
    </section>
  </div>
  <DecryptScenarioModal
    v-if="showDecryptModal && currentEncryptedScenario"
    v-model="showDecryptModal"
    :encrypted-scenario="currentEncryptedScenario"
    @decrypted="onDecrypted"
  />
</template>
