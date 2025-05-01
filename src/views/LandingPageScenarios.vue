<template>
  <div class="relative bg-gray-50 py-5 dark:bg-slate-900">
    <div class="mx-auto max-w-3xl p-4 text-center">
      <h2 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
        Scenarios
      </h2>
    </div>
    <p class="absolute top-2 right-6 z-10">
      <WipBadge />
    </p>
    <section v-if="storedScenarios.length > 0" class="mx-auto max-w-7xl p-6">
      <header
        class="border-b border-gray-200 pb-5 sm:flex sm:items-center sm:justify-between dark:border-slate-800"
      >
        <h2 class="text-base leading-6 font-semibold text-gray-900 dark:text-slate-300">
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
        class="relative top-0 right-0 left-0 bg-gray-200 p-4 text-center text-sm text-gray-900 dark:bg-slate-800 dark:text-slate-300"
      >
        Please note that the demo scenarios are incomplete and they are still under
        development.
      </p>
    </section>
    <div class="mx-auto max-w-3xl px-4 text-center">
      <p class="text-lg text-gray-500">
        Try one of the bundled demo scenarios or create your own
      </p>
    </div>
    <section class="mx-auto max-w-7xl p-6">
      <ul class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <li
          v-for="scenario in DEMO_SCENARIOS"
          :key="scenario.name"
          class="hover:border-army col-span-1 flex flex-col divide-y divide-gray-200 overflow-hidden rounded-lg border bg-white text-center shadow-sm focus-within:border-blue-800 dark:bg-slate-800"
        >
          <router-link
            :to="getScenarioTo(scenario.id)"
            class="flex flex-1 flex-col"
            draggable="false"
          >
            <img
              class="mx-auto h-52 w-full shrink-0 bg-black object-cover object-top"
              :src="scenario.imageUrl"
              alt=""
              draggable="false"
            />
            <h3 class="text-heading mt-6 text-sm font-medium">
              {{ scenario.name }}
            </h3>
            <dl class="mt-1 flex grow flex-col justify-between p-4">
              <dt class="sr-only">Summary</dt>
              <dd class="text-sm text-gray-500 dark:text-slate-400">
                {{ scenario.summary }}
              </dd>
            </dl>
          </router-link>
        </li>
        <li class="col-span-1 flex">
          <button
            type="button"
            @click="newScenario"
            class="relative block w-full rounded-lg border-2 border-dashed border-slate-300 p-12 text-center hover:border-gray-400 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden dark:border-slate-600"
          >
            <svg
              class="mx-auto h-12 w-12 text-slate-400 dark:text-slate-600"
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
            <span
              class="mt-2 block text-sm font-medium text-gray-900 dark:text-slate-300"
            >
              Create new scenario
            </span>
          </button>
        </li>
        <li class="col-span-1 flex">
          <LoadScenarioPanel @loaded="loadScenario" />
        </li>
        <li class="col-span-1 flex">
          <LoadScenarioFromUrlPanel @loaded="loadScenario" />
        </li>
      </ul>
    </section>
  </div>
</template>

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
</script>
