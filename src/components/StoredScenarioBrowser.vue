<script setup lang="ts">
import { computed, type HTMLAttributes, ref } from "vue";
import { Search, X } from "lucide-vue-next";

import ScenarioLinkCard from "@/components/ScenarioLinkCard.vue";
import SortDropdown from "@/components/SortDropdown.vue";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import type { MenuItemData } from "@/components/types";
import type { ScenarioMetadata } from "@/scenariostore/localdb";
import type { StoredScenarioAction } from "@/types/constants";
import { cn } from "@/lib/utils";
import { MAP_EDIT_MODE_ROUTE } from "@/router/names";

const props = withDefaults(
  defineProps<{
    scenarios: ScenarioMetadata[];
    sortOptions: MenuItemData[];
    searchInputId: string;
    autofocus?: boolean;
    noLink?: boolean;
    routeName?: string;
    showClearButton?: boolean;
    emptyMessage?: string;
    class?: HTMLAttributes["class"];
    headerClass?: HTMLAttributes["class"];
    gridClass?: HTMLAttributes["class"];
    emptyClass?: HTMLAttributes["class"];
  }>(),
  {
    autofocus: false,
    noLink: false,
    routeName: MAP_EDIT_MODE_ROUTE,
    showClearButton: false,
    emptyMessage: "No scenarios match",
  },
);

const emit = defineEmits<{
  (e: "action", action: StoredScenarioAction, scenario: ScenarioMetadata): void;
}>();

const scenarioQuery = ref("");
const normalizedScenarioQuery = computed(() => scenarioQuery.value.trim().toLowerCase());
const filteredScenarios = computed(() => {
  if (!normalizedScenarioQuery.value) {
    return props.scenarios;
  }

  return props.scenarios.filter((scenario) => {
    const name = scenario.name.toLowerCase();
    const description = scenario.description?.toLowerCase() ?? "";

    return (
      name.includes(normalizedScenarioQuery.value) ||
      description.includes(normalizedScenarioQuery.value)
    );
  });
});

function onScenarioSearchKeydown(event: KeyboardEvent) {
  if (event.key !== "Escape" || !scenarioQuery.value) {
    return;
  }

  scenarioQuery.value = "";
}

function clearScenarioQuery() {
  scenarioQuery.value = "";
}

function onAction(action: StoredScenarioAction, scenario: ScenarioMetadata) {
  emit("action", action, scenario);
}
</script>

<template>
  <div :class="cn('@container', props.class)">
    <header
      :class="
        cn(
          'border-border flex flex-col gap-4 border-b pb-5 lg:flex-row lg:items-start lg:justify-between',
          props.headerClass,
        )
      "
    >
      <div class="flex min-w-0 flex-1 flex-col gap-3">
        <div class="max-w-xl">
          <label :for="searchInputId" class="sr-only">Search scenarios</label>
          <InputGroup>
            <InputGroupAddon aria-hidden="true">
              <Search class="size-4" />
            </InputGroupAddon>
            <InputGroupInput
              :id="searchInputId"
              v-model="scenarioQuery"
              type="text"
              placeholder="Search scenarios..."
              autocomplete="off"
              :autofocus="autofocus"
              class="h-full"
              @keydown="onScenarioSearchKeydown"
            />
            <InputGroupAddon v-if="showClearButton && scenarioQuery" align="inline-end">
              <InputGroupButton
                size="icon-xs"
                type="button"
                aria-label="Clear scenario search"
                @click="clearScenarioQuery"
              >
                <X class="size-3.5" />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-1 lg:ml-4 lg:justify-end">
        <SortDropdown :options="sortOptions" />
        <slot name="actions" />
      </div>
    </header>

    <ul
      v-if="filteredScenarios.length > 0"
      :class="
        cn(
          'mt-4 grid grid-cols-1 gap-6 @xl:grid-cols-2 @4xl:grid-cols-3 @6xl:grid-cols-4',
          props.gridClass,
        )
      "
    >
      <ScenarioLinkCard
        v-for="info in filteredScenarios"
        :key="info.id"
        :data="info"
        :no-link="noLink"
        :route-name="routeName"
        @action="onAction($event, info)"
      />
    </ul>
    <div
      v-else
      :class="
        cn(
          'text-muted-foreground mt-4 rounded-lg border border-dashed p-6 text-sm',
          props.emptyClass,
        )
      "
    >
      {{ emptyMessage }} "{{ scenarioQuery.trim() }}".
    </div>
  </div>
</template>
