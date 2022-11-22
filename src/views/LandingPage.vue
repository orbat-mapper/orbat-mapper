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
              class="mx-auto mt-3 max-w-md text-base text-gray-500 sm:text-lg md:mt-5 md:max-w-3xl md:text-xl"
            >
              Recreate historic battles and military scenarios
            </p>
          </div>
        </div>
      </section>

      <section id="scenarios">
        <LandingPageScenarios class="mt-16" />
      </section>

      <section id="links" class="bg-gray-100">
        <ProseSection class="">
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
            </ul>
          </div>
        </ProseSection>
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
    </main>
  </div>
</template>

<script setup>
import ProseSection from "../components/ProseSection.vue";
import LandingPageScenarios from "./LandingPageScenarios.vue";
import { Github as GithubIcon } from "mdue";
import { ORBAT_CHART_ROUTE } from "@/router/names";

import { CheckIcon } from "@heroicons/vue/24/outline";

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
    name: "Import MilX",
    description: "Import military map overlays from map.army.",
  },
];
</script>
