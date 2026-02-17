<script setup lang="ts">
import { computed, defineAsyncComponent, ref, watch } from "vue";
import DescriptionItem from "@/components/DescriptionItem.vue";
import PrimaryButton from "@/components/PrimaryButton.vue";
import { renderMarkdown } from "@/composables/formatting";
import { useToggle } from "@vueuse/core";
import PlainButton from "@/components/PlainButton.vue";
import { type ScenarioInfo } from "@/types/scenarioModels";
import dayjs from "dayjs";
import RadioGroupList from "@/components/RadioGroupList.vue";
import { useSymbolSettingsStore } from "@/stores/settingsStore";
import { injectStrict } from "@/utils";
import { activeScenarioKey, timeModalKey } from "@/components/injects";
import { useNotifications } from "@/composables/notifications";
import { resolveTimeZone } from "@/utils/militaryTimeZones";

const { send } = useNotifications();

const { store, io } = injectStrict(activeScenarioKey);
const { getModalTimestamp } = injectStrict(timeModalKey);

const standardSettings = [
  {
    value: "2525",
    name: "MIL-STD-2525D",
    description: "US version",
  },
  {
    value: "app6",
    name: "APP-6",
    description: "NATO version",
  },
];

const TimezoneSelect = defineAsyncComponent(
  () => import("@/components/TimezoneSelect.vue"),
);

const SimpleMarkdownInput = defineAsyncComponent(
  () => import("@/components/SimpleMarkdownInput.vue"),
);

const settingsStore = useSymbolSettingsStore();
const { state } = store;

const isEditMode = ref(false);
const toggleEditMode = useToggle(isEditMode);

const hDescription = computed(() => renderMarkdown(state.info.description || ""));

const form = ref<ScenarioInfo>({
  name: "",
  description: "",
  startTime: 0,
  timeZone: "UTC",
  symbologyStandard: "2525",
});

watch(
  isEditMode,
  (v) => {
    const { name, description, startTime, timeZone, symbologyStandard } =
      store.state.info;
    form.value = {
      name,
      description,
      startTime,
      timeZone,
      symbologyStandard,
    };
  },
  { immediate: true },
);

const computedStartTime = computed(() => {
  try {
    return dayjs(form.value.startTime).tz(resolveTimeZone(form.value.timeZone || "UTC"));
  } catch (e) {
    return dayjs(form.value.startTime);
  }
});

function onDownload() {
  io.downloadAsJson();
}

function onSave() {
  io.saveToIndexedDb();
  send({ message: "Scenario saved to IndexedDB" });
}

function onLoad() {
  io.loadFromLocalStorage();
  send({ message: "Scenario loaded from local storage" });
}

function onFormSubmit() {
  const {
    state: { info },
  } = store;
  updateScenarioInfo(form.value);

  if (info.symbologyStandard) settingsStore.symbologyStandard = info.symbologyStandard;
  isEditMode.value = false;
}

function updateScenarioInfo(data: Partial<ScenarioInfo>) {
  store.update((s) => {
    Object.assign(s.info, { ...data });
  });
}

async function openTimeModal() {
  const newTime = await getModalTimestamp(form.value.startTime!, {
    timeZone: form.value.timeZone,
    title: "Set scenario start time",
  });
  if (newTime !== undefined) {
    form.value.startTime = newTime;
  }
}
</script>

<template>
  <div>
    <form v-if="isEditMode" @submit.prevent="onFormSubmit" class="space-y-4">
      <SimpleMarkdownInput
        label="Description"
        v-model="form.description"
        description="Use markdown syntax for formatting"
      />
      <DescriptionItem label="Start time"
        >{{ computedStartTime.format() }}
        <PlainButton @click="openTimeModal()" class="ml-2">Change</PlainButton>
      </DescriptionItem>
      <TimezoneSelect label="Time zone" v-model="form.timeZone" />
      <RadioGroupList :items="standardSettings" v-model="form.symbologyStandard" />
      <div class="flex justify-end space-x-2">
        <PrimaryButton type="submit">Update</PrimaryButton>
        <PlainButton type="button" @click="toggleEditMode()">Cancel</PlainButton>
      </div>
    </form>
    <div v-else class="space-y-4 p-0">
      <DescriptionItem label="Description">
        <div class="prose-sm prose dark:prose-invert" v-html="hDescription"></div>
      </DescriptionItem>

      <DescriptionItem label="Start time"
        >{{ computedStartTime.format() }}
      </DescriptionItem>
      <DescriptionItem label="Time zone name">{{ state.info.timeZone }}</DescriptionItem>
      <DescriptionItem label="Symbology standard"
        >{{ state.info.symbologyStandard }}
      </DescriptionItem>

      <DescriptionItem label="Number of units"
        >{{ Object.keys(state.unitMap).length }}
      </DescriptionItem>

      <div class="flex items-center space-x-2">
        <PlainButton @click="toggleEditMode()">Edit</PlainButton>
      </div>
    </div>
  </div>
</template>
