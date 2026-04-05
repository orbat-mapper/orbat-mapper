<script setup lang="ts">
import { computed, type HTMLAttributes, ref, watch } from "vue";
import { useEventListener } from "@vueuse/core";
import { Search, X, ListChecksIcon } from "lucide-vue-next";

import DeleteStoredScenariosModal from "@/components/DeleteStoredScenariosModal.vue";
import ScenarioLinkCard from "@/components/ScenarioLinkCard.vue";
import SortDropdown from "@/components/SortDropdown.vue";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import type { MenuItemData } from "@/components/types";
import type { ScenarioMetadata } from "@/scenariostore/localdb";
import type { StoredScenarioAction, StoredScenarioBulkAction } from "@/types/constants";
import { cn } from "@/lib/utils";
import { MAP_EDIT_MODE_ROUTE } from "@/router/names";

const props = withDefaults(
  defineProps<{
    scenarios: ScenarioMetadata[];
    sortOptions: MenuItemData[];
    sortDirection?: "asc" | "desc";
    searchInputId: string;
    autofocus?: boolean;
    noLink?: boolean;
    routeName?: string;
    showClearButton?: boolean;
    enableBatchActions?: boolean;
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
    enableBatchActions: false,
    emptyMessage: "No scenarios match",
  },
);

const emit = defineEmits<{
  (e: "action", action: StoredScenarioAction, scenario: ScenarioMetadata): void;
  (e: "toggle-sort-direction"): void;
  (
    e: "bulk-action",
    action: StoredScenarioBulkAction,
    scenarios: ScenarioMetadata[],
  ): void;
}>();

const scenarioQuery = ref("");
const isSelecting = ref(false);
const selectedIds = ref<Set<string>>(new Set());
const showDeleteSelectedModal = ref(false);
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
const filteredScenarioIds = computed(() =>
  filteredScenarios.value.map((scenario) => scenario.id),
);
const selectedScenarios = computed(() =>
  props.scenarios.filter((scenario) => selectedIds.value.has(scenario.id)),
);
const selectedCount = computed(() => selectedScenarios.value.length);
const allFilteredSelected = computed(
  () =>
    filteredScenarioIds.value.length > 0 &&
    filteredScenarioIds.value.every((id) => selectedIds.value.has(id)),
);

function isEditableTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  );
}

function onScenarioSearchKeydown(event: KeyboardEvent) {
  if (event.key !== "Escape" || !scenarioQuery.value) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  scenarioQuery.value = "";
}

function clearScenarioQuery() {
  scenarioQuery.value = "";
}

function enterSelectMode() {
  if (!props.enableBatchActions) {
    return;
  }

  isSelecting.value = true;
}

function clearSelection() {
  selectedIds.value = new Set();
}

function cancelSelectMode() {
  clearSelection();
  isSelecting.value = false;
  showDeleteSelectedModal.value = false;
}

function toggleScenarioSelection(id: string) {
  const nextSelectedIds = new Set(selectedIds.value);

  if (nextSelectedIds.has(id)) {
    nextSelectedIds.delete(id);
  } else {
    nextSelectedIds.add(id);
  }

  selectedIds.value = nextSelectedIds;
}

function toggleSelectAllFiltered() {
  const nextSelectedIds = new Set(selectedIds.value);

  if (allFilteredSelected.value) {
    for (const id of filteredScenarioIds.value) {
      nextSelectedIds.delete(id);
    }
  } else {
    for (const id of filteredScenarioIds.value) {
      nextSelectedIds.add(id);
    }
  }

  selectedIds.value = nextSelectedIds;
}

function openDeleteSelectedModal() {
  if (!selectedCount.value) {
    return;
  }

  showDeleteSelectedModal.value = true;
}

function confirmDeleteSelected() {
  emit("bulk-action", "delete", selectedScenarios.value);
  showDeleteSelectedModal.value = false;
}

function onAction(action: StoredScenarioAction, scenario: ScenarioMetadata) {
  emit("action", action, scenario);
}

function onToggleSortDirection() {
  emit("toggle-sort-direction");
}

watch(
  () => props.scenarios,
  (scenarios) => {
    if (!selectedIds.value.size) {
      return;
    }

    const availableIds = new Set(scenarios.map((scenario) => scenario.id));
    const nextSelectedIds = new Set(
      [...selectedIds.value].filter((id) => availableIds.has(id)),
    );

    if (nextSelectedIds.size === selectedIds.value.size) {
      return;
    }

    selectedIds.value = nextSelectedIds;
    if (!nextSelectedIds.size) {
      isSelecting.value = false;
    }
  },
);

useEventListener("keydown", (event: KeyboardEvent) => {
  if (
    !isSelecting.value ||
    event.key !== "Escape" ||
    event.defaultPrevented ||
    isEditableTarget(event.target)
  ) {
    return;
  }

  event.preventDefault();
  cancelSelectMode();
});
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
        <SortDropdown
          :options="sortOptions"
          :sort-direction="sortDirection"
          @toggle-direction="onToggleSortDirection"
        />
        <template v-if="enableBatchActions && isSelecting">
          <span class="mr-2 text-sm font-medium">{{ selectedCount }} selected</span>
          <Button
            variant="outline"
            size="sm"
            type="button"
            :disabled="filteredScenarioIds.length === 0"
            @click="toggleSelectAllFiltered"
          >
            {{ allFilteredSelected ? "Deselect all" : "Select all" }}
          </Button>
          <Button
            variant="outline"
            size="sm"
            type="button"
            :disabled="selectedCount === 0"
            @click="clearSelection"
          >
            Clear
          </Button>
          <Button
            variant="destructive"
            size="sm"
            type="button"
            :disabled="selectedCount === 0"
            @click="openDeleteSelectedModal"
          >
            Delete selected
          </Button>
          <Button variant="ghost" size="sm" type="button" @click="cancelSelectMode">
            Cancel
          </Button>
        </template>
        <template v-else>
          <Button
            v-if="enableBatchActions"
            variant="outline"
            type="button"
            @click="enterSelectMode"
          >
            <ListChecksIcon />
            Select
          </Button>
          <slot name="actions" />
        </template>
      </div>
    </header>

    <div class="-m-2 max-h-[60vh] min-h-0 overflow-y-auto p-2">
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
          :selection-mode="isSelecting"
          :selected="selectedIds.has(info.id)"
          @action="onAction($event, info)"
          @toggle-select="toggleScenarioSelection(info.id)"
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
    <DeleteStoredScenariosModal
      v-model="showDeleteSelectedModal"
      :scenarios="selectedScenarios"
      @confirm="confirmDeleteSelected"
      @cancel="showDeleteSelectedModal = false"
    />
  </div>
</template>
