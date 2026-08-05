<script setup lang="ts">
import { computed } from "vue";
import { IconCrosshairsGps } from "@iconify-prerendered/vue-mdi";

import BaseButton from "@/components/BaseButton.vue";
import DotsMenu from "@/components/DotsMenu.vue";
import IconButton from "@/components/IconButton.vue";
import PanelSubHeading from "@/components/PanelSubHeading.vue";
import { activeScenarioKey } from "@/components/injects";
import { useTimeFormatStore } from "@/stores/timeFormatStore";
import type { MenuItemData } from "@/components/types";
import type { StateAction } from "@/types/constants";
import type {
  NScenarioLayerItem,
  ScenarioLayerItemState,
} from "@/types/scenarioLayerItems";
import { injectStrict } from "@/utils";

const props = withDefaults(
  defineProps<{
    item: NScenarioLayerItem;
    heading?: string;
  }>(),
  { heading: "Feature state" },
);

const { store, time, geo } = injectStrict(activeScenarioKey);
const fmt = useTimeFormatStore();

const state = computed<ScenarioLayerItemState[]>(() => props.item.state ?? []);
const menuItems: MenuItemData<StateAction>[] = [{ label: "Delete", action: "delete" }];

function isActive(stateEntry: ScenarioLayerItemState, index: number) {
  if (!state.value.length) return false;
  const nextTimestamp = state.value[index + 1]?.t ?? Number.MAX_VALUE;
  const currentTime = store.state.currentTime;
  return stateEntry.t <= currentTime && nextTimestamp > currentTime;
}

function changeToState(stateEntry: ScenarioLayerItemState) {
  time.setCurrentTime(stateEntry.t);
}

function onStateAction(index: number, action: StateAction) {
  if (action === "delete") {
    geo.deleteLayerItemStateEntry(props.item.id, index);
  }
}

function clearState() {
  geo.clearLayerItemState(props.item.id);
}
</script>

<template>
  <div class="mt-4">
    <PanelSubHeading>{{ heading }}</PanelSubHeading>

    <div class="flex justify-end">
      <BaseButton small @click="clearState()">Clear state</BaseButton>
    </div>

    <ul class="mt-2 divide-y divide-gray-200 border-t border-b border-gray-200">
      <li
        v-for="(stateEntry, index) in state"
        :key="stateEntry.id"
        class="relative flex items-center py-4"
      >
        <div class="flex min-w-0 flex-auto flex-col text-sm">
          <button
            class="flex"
            :class="
              isActive(stateEntry, index)
                ? 'text-foreground font-bold'
                : 'text-muted-foreground font-medium'
            "
          >
            {{ fmt.scenarioFormatter.format(stateEntry.t) }}
          </button>
        </div>
        <div class="relative flex flex-0 items-center space-x-0">
          <IconButton
            title="Goto Time and Place"
            class="bg-muted/50"
            @click="changeToState(stateEntry)"
          >
            <IconCrosshairsGps class="h-5 w-5" aria-hidden="true" />
          </IconButton>
          <DotsMenu :items="menuItems" @action="onStateAction(index, $event)" />
        </div>
      </li>
    </ul>
  </div>
</template>
