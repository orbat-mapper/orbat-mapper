<script setup lang="ts">
import { type ScenarioMetadata } from "@/scenariostore/localdb";
import { MAP_EDIT_MODE_ROUTE } from "@/router/names";
import { formatTimeAgo } from "@vueuse/core";
import DotsMenu from "@/components/DotsMenu.vue";
import { type MenuItemData } from "@/components/types";
import { type StoredScenarioAction } from "@/types/constants";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

withDefaults(
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
  { label: "Copy to clipboard", action: "copyToClipboard" },
];
</script>

<template>
  <Card class="hover:bg-card-foreground/5 ring-ring relative focus-within:ring-2">
    <component
      :is="noLink ? 'button' : 'router-link'"
      v-bind="
        noLink
          ? { type: 'button' }
          : { to: { name: routeName, params: { scenarioId: data.id } } }
      "
      v-on="noLink ? { click: () => emit('action', 'open') } : {}"
      draggable="false"
      class="absolute inset-0 outline-none"
    />

    <CardContent class="flex-auto">
      <p class="text-sm font-medium">{{ data.name }}</p>
      <p class="text-muted-foreground mt-2 line-clamp-4 text-sm">
        {{ data.description }}
      </p>
    </CardContent>
    <CardFooter class="flex items-center justify-between">
      <div class="text-muted-foreground text-sm">
        <p>Modified {{ formatTimeAgo(data.modified) }}</p>
        <p>Created {{ formatTimeAgo(data.created) }}</p>
      </div>
      <DotsMenu :items="menuItems" @action="emit('action', $event)" class="z-10" />
    </CardFooter>
  </Card>
</template>
