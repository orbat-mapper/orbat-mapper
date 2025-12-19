<script setup lang="ts">
import { injectStrict } from "@/utils";
import { activeScenarioKey, timeModalKey } from "@/components/injects";
import { computed } from "vue";
import type { NScenarioEvent } from "@/types/internalModels";
import PanelHeading from "@/components/PanelHeading.vue";
import { useTimeFormatStore } from "@/stores/timeFormatStore";
import ScenarioEventDropdownMenu from "@/modules/scenarioeditor/ScenarioEventDropdownMenu.vue";
import type { ScenarioEventAction } from "@/types/constants";
import { useSelectedItems } from "@/stores/selectedStore";
import { Button } from "@/components/ui/button";

interface Props {
  selectOnly?: boolean;
  hideDropdown?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  selectOnly: false,
  hideDropdown: false,
});
const emit = defineEmits(["event-click"]);

const {
  store,
  time: { goToScenarioEvent, deleteScenarioEvent, updateScenarioEvent, addScenarioEvent },
} = injectStrict(activeScenarioKey);
const { getModalTimestamp } = injectStrict(timeModalKey);
const { activeScenarioEventId } = useSelectedItems();
const fmt = useTimeFormatStore();
const events = computed(() => store.state.events.map((id) => store.state.eventMap[id]));
const t = computed(() => store.state.currentTime);

function onEventClick(event: NScenarioEvent) {
  if (!props.selectOnly) goToScenarioEvent(event);
  emit("event-click", event);
}

async function onAction(action: ScenarioEventAction, eventId: string) {
  const scenarioEvent = store.state.eventMap[eventId];
  if (!scenarioEvent) return;
  switch (action) {
    case "changeTime":
      const newTimestamp = await getModalTimestamp(scenarioEvent.startTime, {
        timeZone: store.state.info.timeZone,
        title: "Set scenario event time",
      });
      if (newTimestamp !== undefined) {
        updateScenarioEvent(eventId, { startTime: newTimestamp });
      }
      break;
    case "delete":
      deleteScenarioEvent(eventId);
      break;
  }
}

function addEvent() {
  const day = new Date(t.value).getDate();
  activeScenarioEventId.value = addScenarioEvent({
    title: `Event ${day}`,
    startTime: t.value,
  });
}
</script>
<template>
  <div class="p-0.5">
    <PanelHeading>Scenario events</PanelHeading>

    <div class="flow-root">
      <ul class="mt-4">
        <li v-for="(event, eventIdx) in events" :key="event.id" class="group flex">
          <div class="relative flex-auto pb-4">
            <span
              v-if="eventIdx !== events.length - 1"
              class="bg-muted-foreground/30 absolute top-2 left-2 -ml-px h-full w-0.5"
              aria-hidden="true"
            />
            <div class="relative flex space-x-4">
              <button
                @click="onEventClick(event)"
                class="ring-ring mt-1 flex size-4 items-center justify-center rounded-full ring-4"
                :class="{
                  'bg-muted': event.startTime > t,
                  // 'bg-muted': event.startTime < t,
                  'bg-accent-foreground': event.startTime === t,
                }"
              ></button>
              <div
                class="min-w-0 flex-1 cursor-pointer text-sm"
                @click="onEventClick(event)"
              >
                <p class="text-muted-foreground text-xs font-medium">
                  {{ fmt.scenarioDateFormatter.format(event.startTime) }}
                </p>
                <p class="font-medium">{{ event.title }}</p>
                <p v-if="event.subTitle" class="text-muted-foreground">
                  {{ event.subTitle }}
                </p>
              </div>
            </div>
          </div>
          <div
            v-if="!hideDropdown"
            class="opacity-0 group-focus-within:opacity-100 group-hover:opacity-100"
          >
            <ScenarioEventDropdownMenu hide-edit @action="onAction($event, event.id)" />
          </div>
        </li>
      </ul>
    </div>

    <Button
      v-if="!selectOnly"
      size="sm"
      variant="secondary"
      @click="addEvent()"
      class="mt-4"
      >Add scenario event</Button
    >
  </div>
</template>
