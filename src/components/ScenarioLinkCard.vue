<template>
  <div
    class="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:border-gray-400"
  >
    <div class="min-w-0 flex-1">
      <router-link
        :to="{ name: MAP_EDIT_MODE_ROUTE, params: { scenarioId: data.id } }"
        class="focus:outline-none"
      >
        <span class="absolute inset-0" aria-hidden="true" />
        <p class="text-sm font-medium text-gray-900">{{ data.name }}</p>
        <p class="truncate text-sm text-gray-500">{{ data.description }}</p>
        <p class="truncate text-sm leading-7 text-gray-500">
          {{ data.modified.toISOString() }}
        </p>
      </router-link>
    </div>
  </div>
</template>
<script setup lang="ts">
import { type ScenarioMetadata } from "@/scenariostore/localdb";
import { MAP_EDIT_MODE_ROUTE } from "@/router/names";

const props = defineProps<{ data: ScenarioMetadata }>();
</script>
