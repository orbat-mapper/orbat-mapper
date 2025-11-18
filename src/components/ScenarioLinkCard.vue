<template>
  <div
    class="relative flex flex-col rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-xs focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:border-gray-400 dark:border-slate-600 dark:bg-slate-800"
  >
    <div class="relative flex-1">
      <component
        :is="noLink ? 'button' : 'router-link'"
        v-bind="
          noLink
            ? { type: 'button' }
            : { to: { name: routeName, params: { scenarioId: data.id } } }
        "
        v-on="noLink ? { click: () => emit('action', 'open') } : {}"
        class="text-left focus:outline-hidden"
        draggable="false"
      >
        <span class="absolute inset-0" aria-hidden="true" />
        <p class="text-heading text-sm font-medium">{{ data.name }}</p>
        <p class="mt-2 line-clamp-3 text-sm text-gray-500 dark:text-slate-400">
          {{ data.description }}
        </p>
      </component>
    </div>
    <footer class="-mr-2 flex flex-none items-center justify-between pt-4">
      <div>
        <p class="truncate text-sm text-gray-500 dark:text-slate-500">
          Modified {{ formatTimeAgo(data.modified) }}
        </p>
        <p class="truncate text-sm dark:text-slate-500">
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
import { type MenuItemData } from "@/components/types";
import { type StoredScenarioAction } from "@/types/constants";

const props = withDefaults(
  defineProps<{ data: ScenarioMetadata; noLink?: boolean; routeName?: string }>(),
  {
    noLink: false,
    routeName: MAP_EDIT_MODE_ROUTE,
  },
);
const emit = defineEmits(["action"]);
const menuItems: MenuItemData<StoredScenarioAction>[] = [
  { label: "Open", action: "open" },
  { label: "Delete ...", action: "delete" },
  { label: "Download", action: "download" },
  { label: "Duplicate", action: "duplicate" },
];
</script>
