<template>
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
</template>
<script setup>
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
