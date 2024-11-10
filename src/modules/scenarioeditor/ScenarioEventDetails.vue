<script setup lang="ts">
import { injectStrict } from "@/utils";
import { activeScenarioKey, timeModalKey } from "@/components/injects";
import { EntityId } from "@/types/base";
import { computed, ref, watch } from "vue";
import EditableLabel from "@/components/EditableLabel.vue";
import { useUiStore } from "@/stores/uiStore";
import ScenarioEventDropdownMenu from "@/modules/scenarioeditor/ScenarioEventDropdownMenu.vue";
import { useTimeFormatStore } from "@/stores/timeFormatStore";
import { ScenarioEventAction } from "@/types/constants";
import { useSelectedItems } from "@/stores/selectedStore";

interface Props {
  eventId: EntityId;
}

const props = defineProps<Props>();

const {
  time: { updateScenarioEvent },
} = injectStrict(activeScenarioKey);
const { getModalTimestamp } = injectStrict(timeModalKey);

const title = ref("");

const { time, store } = injectStrict(activeScenarioKey);

const ui = useUiStore();
const fmt = useTimeFormatStore();
const { clear: clearSelected } = useSelectedItems();
const scenarioEvent = computed(() => time.getEventById(props.eventId));

const formattedEventTime = computed(() => {
  return fmt.scenarioFormatter.format(scenarioEvent.value?.startTime ?? 0);
});

watch(
  () => props.eventId,
  () => {
    title.value = scenarioEvent.value?.title ?? "";
  },
  { immediate: true },
);

function updateTitle(value: string) {
  updateScenarioEvent(props.eventId, { title: value });
}

async function onAction(action: ScenarioEventAction) {
  switch (action) {
    case "changeTime":
      const newTimestamp = await getModalTimestamp(scenarioEvent.value.startTime, {
        timeZone: store.state.info.timeZone,
        title: "Set scenario event time",
      });
      if (newTimestamp !== undefined) {
        updateScenarioEvent(props.eventId, { startTime: newTimestamp });
      }
      break;
    case "delete":
      time.deleteScenarioEvent(props.eventId);
      clearSelected();
      break;
  }
}
</script>
<template>
  <div v-if="scenarioEvent" :key="scenarioEvent.id">
    <header class="">
      <EditableLabel v-model="title" @updateValue="updateTitle" />
    </header>
    <nav class="flex items-center justify-between">
      <div class="text-sm font-medium">{{ formattedEventTime }}</div>
      <ScenarioEventDropdownMenu @action="onAction" />
    </nav>
    <pre v-if="ui.debugMode">{{ scenarioEvent }}</pre>
  </div>
</template>
