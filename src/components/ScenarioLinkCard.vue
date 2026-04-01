<script setup lang="ts">
import { computed } from "vue";

import { type ScenarioMetadata } from "@/scenariostore/localdb";
import { MAP_EDIT_MODE_ROUTE } from "@/router/names";
import { formatTimeAgo } from "@vueuse/core";
import DotsMenu from "@/components/DotsMenu.vue";
import { type MenuItemData } from "@/components/types";
import { type StoredScenarioAction } from "@/types/constants";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const props = withDefaults(
  defineProps<{
    data: ScenarioMetadata;
    noLink?: boolean;
    routeName?: string;
    selectionMode?: boolean;
    selected?: boolean;
  }>(),
  {
    noLink: false,
    routeName: MAP_EDIT_MODE_ROUTE,
    selectionMode: false,
    selected: false,
  },
);
const emit = defineEmits(["action", "toggle-select"]);
const menuItems: MenuItemData<StoredScenarioAction>[] = [
  { label: "Open", action: "open" },
  { label: "Delete ...", action: "delete" },
  { label: "Download", action: "download" },
  { label: "Duplicate", action: "duplicate" },
  { label: "Copy to clipboard", action: "copyToClipboard" },
];

const checkboxId = computed(() => `select-scenario-${props.data.id}`);

function onCardClick() {
  if (!props.selectionMode) {
    return;
  }

  emit("toggle-select");
}

function onCardKeydown(event: KeyboardEvent) {
  if (!props.selectionMode) {
    return;
  }

  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  event.preventDefault();
  emit("toggle-select");
}
</script>

<template>
  <Card
    :class="
      cn(
        'hover:bg-card-foreground/5 ring-ring relative focus-within:ring-2',
        selectionMode && 'cursor-pointer outline-none focus:ring-2',
        selectionMode && selected && 'border-primary bg-primary/5 ring-2',
      )
    "
    :tabindex="selectionMode ? 0 : undefined"
    :role="selectionMode ? 'button' : undefined"
    :aria-pressed="selectionMode ? selected : undefined"
    @click="onCardClick"
    @keydown="onCardKeydown"
  >
    <component
      v-if="!selectionMode"
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
      <div v-if="selectionMode" class="mb-4 flex items-start justify-end" @click.stop>
        <div class="flex items-center gap-2" @keydown.stop>
          <Checkbox
            :id="checkboxId"
            :model-value="selected"
            :aria-label="`Select scenario ${data.name}`"
            @update:model-value="emit('toggle-select')"
          />
          <label :for="checkboxId" class="sr-only">Select {{ data.name }}</label>
        </div>
      </div>
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
      <DotsMenu
        v-if="!selectionMode"
        :items="menuItems"
        @action="emit('action', $event)"
        class="z-10"
      />
    </CardFooter>
  </Card>
</template>
