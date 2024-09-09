<script setup lang="ts">
import PanelSubHeading from "@/components/PanelSubHeading.vue";
import { ScenarioFeature, ScenarioFeatureState } from "@/types/scenarioGeoModels";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { computed } from "vue";
import { useTimeFormatStore } from "@/stores/timeFormatStore";
import { StateAction } from "@/types/constants";
import DotsMenu from "@/components/DotsMenu.vue";
import { IconCrosshairsGps } from "@iconify-prerendered/vue-mdi";
import IconButton from "@/components/IconButton.vue";
import { MenuItemData } from "@/components/types";
import ToggleField from "@/components/ToggleField.vue";
import { useMainToolbarStore } from "@/stores/mainToolbarStore";
import BaseButton from "@/components/BaseButton.vue";

const props = defineProps<{ feature: ScenarioFeature }>();
const { store, time, geo } = injectStrict(activeScenarioKey);
const fmt = useTimeFormatStore();
const st = useMainToolbarStore();

const state = computed(() => props.feature.state ?? []);

const menuItems: MenuItemData<StateAction>[] = [{ label: "Delete", action: "delete" }];

const isActive = (s: ScenarioFeatureState, index: number) => {
  if (!state.value?.length) return;
  const nextTimestamp = state.value[index + 1]?.t || Number.MAX_VALUE;
  const currentTime = store.state.currentTime;
  return s.t <= currentTime && nextTimestamp > currentTime;
};

const changeToState = (stateEntry: ScenarioFeatureState) => {
  time.setCurrentTime(stateEntry.t);
};

async function onStateAction(index: number, action: StateAction) {
  if (action === "delete") {
    geo.deleteFeatureStateEntry(props.feature.id, index);
  }
  store.state.featureStateCounter++;
}

function clearState() {
  geo.updateFeature(props.feature.id, { state: [] });
}
</script>
<template>
  <div class="mt-4">
    <PanelSubHeading>Feature state</PanelSubHeading>

    <div class="flex justify-end">
      <BaseButton small @click="clearState()">Clear state</BaseButton>
    </div>

    <ul class="mt-2 divide-y divide-gray-200 border-b border-t border-gray-200">
      <li v-for="(s, index) in state" class="relative flex items-center py-4" :key="s.id">
        <div class="flex min-w-0 flex-auto flex-col text-sm">
          <button
            class="flex"
            :class="
              isActive(s, index) ? 'font-bold text-gray-900' : 'font-medium text-gray-500'
            "
          >
            {{ fmt.scenarioFormatter.format(s.t) }}
          </button>
        </div>
        <div class="flex-0 relative flex items-center space-x-0">
          <IconButton
            title="Goto Time and Place"
            @click="changeToState(s)"
            class="bg-gray-50"
          >
            <IconCrosshairsGps class="h-5 w-5" aria-hidden="true" />
          </IconButton>
          <DotsMenu :items="menuItems" @action="onStateAction(index, $event)" />
        </div>
      </li>
    </ul>
  </div>
</template>
