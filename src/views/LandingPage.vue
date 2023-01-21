<template>
  <div class="flex h-full flex-col bg-gray-100">
    <header>
      <p class="relative top-0 left-0 right-0 bg-gray-300 p-1 text-center text-gray-900">
        This is a work in progress prototype. Follow the
        <a href="https://github.com/orbat-mapper/orbat-mapper" class="underline"
          >development on GitHub <GithubIcon class="inline h-6 w-6 sm:h-10 sm:w-10" /> </a
        >.
      </p>
      <nav>
        <div></div>
      </nav>
    </header>

    <main>
      <section class="mt-16 sm:mt-24">
        <div class="mx-auto max-w-7xl px-4 sm:px-6">
          <div class="text-center">
            <h1
              class="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl"
            >
              <span class="text-red-900">ORBAT</span>
              Mapper
            </h1>
            <p
              class="mx-auto mt-3 max-w-md text-base text-gray-700 sm:text-lg md:mt-5 md:max-w-3xl md:text-xl"
            >
              Recreate historic battles and military scenarios in your browser
            </p>
            <p class="mt-4">
              <a
                class="text-base font-semibold text-indigo-600 hover:text-indigo-700"
                href="https://docs.orbat-mapper.app/guide/about-orbat-mapper"
                target="_blank"
                >View documentation →</a
              >
            </p>
          </div>
        </div>
      </section>

      <section v-if="info" class="mt-16 bg-yellow-800 text-yellow-200">
        <p class="mx-auto max-w-7xl p-4 text-center sm:px-6">
          Currently loaded scenario is <span class="font-bold">{{ info.name }}</span
          >.
          <router-link
            to="/scenario"
            class="font-semibold text-lime-300 hover:text-lime-600"
            >Go to scenario editor →</router-link
          >
        </p>
      </section>

      <section id="scenarios">
        <LandingPageScenarios class="mt-16" />
      </section>

      <section id="features" class="bg-white">
        <div class="mx-auto max-w-7xl py-16 px-4 sm:px-6 lg:py-24 lg:px-8">
          <div class="mx-auto max-w-3xl text-center">
            <h2 class="text-3xl font-bold tracking-tight text-gray-900">Features</h2>
            <p class="mt-4 text-lg text-gray-500">
              Some of the things you can do with ORBAT mapper
            </p>
          </div>
          <dl
            class="mt-12 space-y-10 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-12 sm:space-y-0 lg:grid-cols-4 lg:gap-x-8"
          >
            <div v-for="feature in features" :key="feature.name" class="relative">
              <dt>
                <CheckIcon class="absolute h-6 w-6 text-green-500" aria-hidden="true" />
                <p class="ml-9 text-lg font-medium leading-6 text-gray-900">
                  {{ feature.name }}
                </p>
              </dt>
              <dd class="mt-2 ml-9 text-base text-gray-500">{{ feature.description }}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section id="links" class="bg-gray-100">
        <ProseSection class="">
          <p class="text-center">Links to work in progress components and experiments</p>
          <div class="grid grid-cols-2 place-items-center gap-4">
            <div class="aspect-w-5 aspect-h-2 overflow-hidden rounded-lg">
              <img
                src="/images/orbat-chart-demo-min.png"
                width="2136"
                height="1780"
                class="object-cover object-top"
              />
            </div>
            <ul class="flex flex-col gap-4">
              <router-link :to="{ name: ORBAT_CHART_ROUTE }" class="flex-shrink-0"
                >Orbat chart test
              </router-link>
              <router-link to="/storymode" class="">Story mode test</router-link>
              <router-link to="/testgrid" class="">Test grid</router-link>
            </ul>
          </div>
        </ProseSection>
      </section>
    </main>
    <footer class="bg-white">
      <div class="mx-auto max-w-7xl overflow-hidden py-20 px-6 sm:py-24 lg:px-8">
        <nav
          class="-mb-6 columns-2 sm:flex sm:justify-center sm:space-x-12"
          aria-label="Footer"
        >
          <div class="pb-6">
            <a
              href="https://docs.orbat-mapper.app/guide/about-orbat-mapper"
              class="text-sm leading-6 text-gray-600 hover:text-gray-900"
              >About</a
            >
          </div>

          <div class="pb-6">
            <a
              href="https://docs.orbat-mapper.app/guide/getting-started"
              class="text-sm leading-6 text-gray-600 hover:text-gray-900"
              >Getting started</a
            >
          </div>

          <div class="pb-6">
            <a
              href="https://docs.orbat-mapper.app/resources/tools"
              class="text-sm leading-6 text-gray-600 hover:text-gray-900"
              >Resources</a
            >
          </div>
        </nav>
        <div class="mt-10 flex justify-center space-x-10">
          <a
            href="https://github.com/orbat-mapper/orbat-mapper"
            class="text-gray-400 hover:text-gray-500"
          >
            <span class="sr-only">GitHub</span>
            <svg
              class="h-6 w-6"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clip-rule="evenodd"
              />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import ProseSection from "../components/ProseSection.vue";
import LandingPageScenarios from "./LandingPageScenarios.vue";
import { Github as GithubIcon } from "mdue";
import { ORBAT_CHART_ROUTE } from "@/router/names";

import { CheckIcon } from "@heroicons/vue/24/outline";
import { useScenario } from "@/scenariostore";
import { computed } from "vue";

const { scenario, isReady } = useScenario();

const info = computed(() => isReady.value && scenario.value.store.state.info);
const features = [
  {
    name: "Create ORBATs",
    description: "Quickly build ORBATs.",
  },
  {
    name: "Draw features",
    description: "",
  },
  {
    name: "Client side only",
    description: "Everything is stored on your computer.",
  },
  {
    name: "Grid edit moe",
    description: "Efficient editing.",
  },
  {
    name: "Export to KML/KMZ",
    description: "View your scenario in 3D with Google Earth.",
  },
  {
    name: "Export as GeoJSON",
    description: "",
  },
  {
    name: "Import MilX",
    description: "Import military map overlays from map.army.",
  },
  {
    name: "Import GeoJSON",
    description: "",
  },
];
</script>
