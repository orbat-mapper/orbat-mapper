<script setup lang="ts">
import { injectStrict } from "@/utils";
import { activeScenarioKey, timeModalKey } from "@/components/injects";
import { type EntityId } from "@/types/base";
import { computed, ref, watch } from "vue";
import EditableLabel from "@/components/EditableLabel.vue";
import { useUiStore } from "@/stores/uiStore";
import ScenarioEventDropdownMenu from "@/modules/scenarioeditor/ScenarioEventDropdownMenu.vue";
import { useTimeFormatStore } from "@/stores/timeFormatStore";
import type { ScenarioEventAction } from "@/types/constants";
import { useSelectedItems } from "@/stores/selectedStore";
import ItemMedia from "@/modules/scenarioeditor/ItemMedia.vue";
import ScrollTabs from "@/components/ScrollTabs.vue";
import { TabsContent } from "@/components/ui/tabs";
import EditMetaForm from "@/modules/scenarioeditor/EditMetaForm.vue";
import EditMediaForm from "@/modules/scenarioeditor/EditMediaForm.vue";
import { useToggle } from "@vueuse/core";
import type { MediaUpdate, ScenarioEventUpdate } from "@/types/internalModels";
import DescriptionItem from "@/components/DescriptionItem.vue";
import { renderMarkdown } from "@/composables/formatting";

interface Props {
  eventId: EntityId;
}

const props = defineProps<Props>();

const {
  time: { updateScenarioEvent, onGoToScenarioEventEvent },
} = injectStrict(activeScenarioKey);
const { getModalTimestamp } = injectStrict(timeModalKey);

const title = ref("");
const isEditMode = ref(false);
const toggleEditMode = useToggle(isEditMode);

const isEditMediaMode = ref(false);
const toggleEditMediaMode = useToggle(isEditMediaMode);

const { time, store } = injectStrict(activeScenarioKey);

const ui = useUiStore();
const fmt = useTimeFormatStore();
const { clear: clearSelected, activeScenarioEventId } = useSelectedItems();
const scenarioEvent = computed(() => time.getEventById(props.eventId));

const formattedEventTime = computed(() => {
  return fmt.scenarioFormatter.format(scenarioEvent.value?.startTime ?? 0);
});

const media = computed(() => {
  return scenarioEvent.value?.media?.[0];
});

const tabList = computed(() => {
  const base = [{ label: "Details", value: "0" }];
  if (ui.debugMode) {
    base.push({ label: "Debug", value: "1" });
  }
  return base;
});

const selectedTab = ref("0");

watch(
  () => props.eventId,
  () => {
    title.value = scenarioEvent.value?.title ?? "";
  },
  { immediate: true },
);

const hDescription = computed(() =>
  renderMarkdown(scenarioEvent.value.description || ""),
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
    case "editMeta":
      toggleEditMode();
      break;
    case "editMedia":
      toggleEditMediaMode();
      break;
  }
}

onGoToScenarioEventEvent(({ event }) => {
  if (event.id !== props.eventId) {
    activeScenarioEventId.value = event.id;
  }
});

function updateMedia(mediaUpdate: MediaUpdate) {
  if (!mediaUpdate) return;
  const { media = [] } = scenarioEvent.value;
  const newMedia = { ...media[0], ...mediaUpdate };
  updateScenarioEvent(props.eventId, { media: [newMedia] });
  isEditMediaMode.value = false;
}

const onFormSubmit = (eventUpdate: ScenarioEventUpdate) => {
  updateScenarioEvent(props.eventId, eventUpdate);
  toggleEditMode();
};
</script>
<template>
  <div v-if="scenarioEvent" :key="scenarioEvent.id" class="p-1">
    <ItemMedia v-if="media" :media="media" />
    <header class="">
      <EditableLabel v-model="title" @updateValue="updateTitle" />
      <nav class="flex items-center justify-between">
        <div class="text-sm font-medium">{{ formattedEventTime }}</div>
        <ScenarioEventDropdownMenu @action="onAction" />
      </nav>
    </header>
    <div class="-mx-4">
      <ScrollTabs :items="tabList" v-model="selectedTab">
        <TabsContent value="0" class="mx-4 pt-4">
          <EditMetaForm
            v-if="isEditMode"
            :item="scenarioEvent"
            @update="onFormSubmit"
            @cancel="toggleEditMode()"
          />
          <EditMediaForm
            v-else-if="isEditMediaMode"
            :media="media"
            @cancel="toggleEditMediaMode()"
            @update="updateMedia"
            class=""
          />
          <div v-else class="">
            <div v-if="scenarioEvent.description">
              <div class="prose prose-sm dark:prose-invert" v-html="hDescription"></div>
            </div>
            <DescriptionItem
              v-if="scenarioEvent.externalUrl"
              label="External URL"
              dd-class="truncate"
              class="mt-4"
              ><a
                target="_blank"
                draggable="false"
                class="underline"
                :href="scenarioEvent.externalUrl"
                >{{ scenarioEvent.externalUrl }}</a
              ></DescriptionItem
            >
          </div>
        </TabsContent>
        <TabsContent value="1" v-if="ui.debugMode" class="mx-4">
          <pre v-if="ui.debugMode">{{ scenarioEvent }}</pre>
        </TabsContent>
      </ScrollTabs>
    </div>
  </div>
</template>
