<template>
  <div class="min-h-screen overflow-hidden bg-gray-100">
    <main>
      <ProseSection class="">
        <h1><span class="text-red-900">Order of Battle</span> Mapper</h1>
        <p>Recreate historic battles and military scenarios.</p>

        <p>
          This is a work in progress prototype. Follow the development of
          <a href="https://github.com/orbat-mapper/orbat-mapper"
            >ORBAT Mapper on GitHub <GithubIcon class="inline h-10 w-10" /> </a
          >.
        </p>

        <div class="grid grid-cols-2 place-items-center gap-4">
          <div class="aspect-w-5 aspect-h-2 overflow-hidden rounded-lg bg-gray-100">
            <img
              src="/images/orbat-chart-demo-min.png"
              width="2136"
              height="1780"
              class="object-cover object-top"
            />
          </div>
          <router-link :to="{ name: ORBAT_CHART_ROUTE }" class="flex-shrink-0"
            >Orbat chart test
          </router-link>
        </div>
        <ul class="flex flex-wrap gap-x-6 gap-y-2">
          <router-link to="/storymode" class="">Story mode test</router-link>
          <router-link :to="{ name: ORBAT_CHART_ROUTE }" class=""
            >Orbat chart test
          </router-link>
        </ul>
      </ProseSection>

      <LandingPageScenarios />

      <div class="bg-white">
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
      </div>

      <ProseSection class="">
        <h2>Other tools and resources</h2>

        <p>
          ORBAT mapper is created by a hobbyist. If you need something more professional
          or you want to create military overlays, try some of these excellent tools
          instead:
        </p>

        <ul>
          <li>
            <p>
              <a href="https://www.map.army/about/en.html">map.army</a> - a really nice
              web application for drawing map overlays with symbols and tactical graphics.
            </p>
          </li>

          <li>
            <p>
              <a href="https://mgrs-mapper.com/">MGRS Mapper</a> -
              <q>operational graphics tool for junior leaders</q>. Subscription based
              service. A limited free version is available.
            </p>
          </li>

          <li>
            <p>
              <a href="https://odin.syncpoint.io/en/"
                >ODIN open source command and control information system</a
              >. Desktop application available on most operating systems (Electron based).
              Still under development, but looks very promising!
            </p>
          </li>
        </ul>

        <h3>Military history</h3>

        <p>
          If you are interested in WW2 history I highly recommend the site
          <a href="https://www.project44.ca/">Project'44 the road to liberation</a>. Their
          <a href="https://map.project44.ca/">interactive WWII web map</a> and
          <a href="https://map.project44.ca/story-maps">story maps</a> are fantastic!
        </p>

        <p>
          For those who are interested in Cold War history, Hans Boersma's site
          <a href="https://www.orbat85.nl/"
            >Netherlands Armed Forces ORDER OF BATTLE 1985</a
          >
          is a real treat.
        </p>
      </ProseSection>
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
