<script setup lang="ts">
import { MAP_EDIT_MODE_ROUTE } from "@/router/names";

// The demo scenarios and their thumbnails are files on the server, under `public/scenarios/`.
// The standalone build replaces this whole module, thus the names, the summaries and the image
// paths leave the bundle with it. See `vite.singlefile.config.ts`.
const DEMO_SCENARIOS = [
  {
    name: "The Falklands War 1982",
    id: "falkland82",
    summary:
      "The Falklands War was a military conflict that took place in 1982 between Argentina and the United Kingdom. Argentina invaded the Falkland Islands on April 2, 1982, and the UK responded by sending a task force to retake the islands.",
    imageUrl: "/scenarios/images/HMS_Broadsword_and_Hermes_1982_IWM.jpg",
  },
  {
    name: "Battles of Narvik 1940",
    id: "narvik40",
    summary:
      "A series of naval and land engagements fought between German and Allied forces from April to June 1940. The battles marked the first Allied victory against Germany in the war.",
    imageUrl:
      "/scenarios/images/Norwegian_Army_Colt_heavy_machine_gun_at_the_Narvik_front.jpg",
  },
];

// One `<li>` for each demo, thus the list items stay in the grid of the parent `<ul>`.
const getScenarioTo = (scenarioId: string) => ({
  name: MAP_EDIT_MODE_ROUTE,
  params: { scenarioId: `demo-${scenarioId}` },
});
</script>

<template>
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
</template>
