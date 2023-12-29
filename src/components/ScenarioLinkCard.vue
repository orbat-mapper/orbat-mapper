<template>
  <div
    class="relative flex flex-col rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:border-gray-400"
  >
    <div class="relative flex-1">
      <router-link
        :to="{ name: MAP_EDIT_MODE_ROUTE, params: { scenarioId: data.id } }"
        class="focus:outline-none"
        draggable="false"
      >
        <span class="absolute inset-0" aria-hidden="true" />
        <p class="text-sm font-medium text-gray-900">{{ data.name }}</p>
        <p class="line-clamp-3 text-sm text-gray-500">{{ data.description }}</p>
      </router-link>
    </div>
    <footer class="-mr-2 flex flex-none items-center justify-between pt-4">
      <div>
        <p class="truncate text-sm text-gray-500">
          Modified {{ formatTimeAgo(data.modified) }}
        </p>
        <p class="truncate text-sm text-gray-500">
          Created {{ formatTimeAgo(data.created) }}
        </p>
      </div>
      <DotsMenu :items="menuItems" @action="emit('action', $event)" />
    </footer>
  </div>
</template>
<script setup lang="ts">
import { type ScenarioMetadata } from "@/scenariostore/localdb";
import { MAP_EDIT_MODE_ROUTE } from "@/router/names";
import { formatTimeAgo } from "@vueuse/core";
import DotsMenu from "@/components/DotsMenu.vue";
import { MenuItemData } from "@/components/types";
import { StoredScenarioAction } from "@/types/constants";

const props = defineProps<{ data: ScenarioMetadata }>();
const emit = defineEmits(["action"]);
const menuItems: MenuItemData<StoredScenarioAction>[] = [
  { label: "Open", action: "open" },
  { label: "Delete ...", action: "delete" },
  { label: "Download", action: "download" },
  { label: "Duplicate", action: "duplicate" },
];
</script>
