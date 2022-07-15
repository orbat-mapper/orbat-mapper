<template>
  <div>
    <form v-if="isEditMode" @submit.prevent="onFormSubmit" class="space-y-4 p-6">
      <InputGroup label="Name" v-model="form.name" id="name-input" />
      <SimpleMarkdownInput
        label="Description"
        v-model="form.description"
        description="Use markdown syntax for formatting"
      />
      <DescriptionItem label="Start time"
        >{{ computedStartTime.format() }}
        <PlainButton @click="showTimeModal = true" class="ml-2">Change</PlainButton>
      </DescriptionItem>
      <TimezoneSelect label="Time zone" v-model="form.timeZone" />
      <RadioGroupList :settings="standardSettings" v-model="form.symbologyStandard" />
      <div class="flex justify-end space-x-2">
        <PrimaryButton type="submit">Update</PrimaryButton>
        <PlainButton type="button" @click="toggleEditMode()">Cancel</PlainButton>
      </div>
      <InputDateModal
        v-model="showTimeModal"
        dialog-title="Set scenario start time"
        v-model:timestamp="form.startTime"
        :time-zone="state.info.timeZone"
      />
    </form>
    <div v-else class="space-y-4 p-6">
      <DescriptionItem label="Title">{{ state.info.name }}</DescriptionItem>

      <DescriptionItem label="Description">
        <div class="prose-esm prose dark:prose-invert" v-html="hDescription"></div>
      </DescriptionItem>

      <DescriptionItem label="Start time"
        >{{ computedStartTime.format() }}
      </DescriptionItem>
      <DescriptionItem label="Time zone name">{{ state.info.timeZone }}</DescriptionItem>
      <DescriptionItem label="Symbology standard"
        >{{ state.info.symbologyStandard }}
      </DescriptionItem>

      <div class="flex items-center space-x-2">
        <PlainButton @click="toggleEditMode()">Edit mode</PlainButton>
        <SecondaryButton @click="onDownload">Download</SecondaryButton>
        <PrimaryButton @click="onSave">Save</PrimaryButton>
        <PrimaryButton @click="onLoad">Load</PrimaryButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, ref, watch } from "vue";
import DescriptionItem from "@/components/DescriptionItem.vue";
import PrimaryButton from "@/components/PrimaryButton.vue";
import SecondaryButton from "@/components/SecondaryButton.vue";
import { renderMarkdown } from "@/composables/formatting";
import { useToggle } from "@vueuse/core";
import PlainButton from "@/components/PlainButton.vue";
import { type ScenarioInfo } from "@/types/scenarioModels";
import InputGroup from "@/components/InputGroup.vue";
import dayjs from "dayjs";
import RadioGroupList from "@/components/RadioGroupList.vue";
import { useSettingsStore } from "@/stores/settingsStore";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { useNotifications } from "@/composables/notifications";

const { send } = useNotifications();

const { store, io } = injectStrict(activeScenarioKey);

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
  () => import("@/components/TimezoneSelect.vue")
);

const InputDateModal = defineAsyncComponent(
  () => import("@/components/InputDateModal.vue")
);
const SimpleMarkdownInput = defineAsyncComponent(
  () => import("@/components/SimpleMarkdownInput.vue")
);

const settingsStore = useSettingsStore();
const { state } = store;

const isEditMode = ref(false);
const toggleEditMode = useToggle(isEditMode);

const showTimeModal = ref(false);

const hDescription = computed(() => renderMarkdown(state.info.description || ""));

let form = ref<ScenarioInfo>({
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
  { immediate: true }
);

const computedStartTime = computed(() => {
  try {
    return dayjs(form.value.startTime).tz(form.value.timeZone);
  } catch (e) {
    return dayjs(form.value.startTime);
  }
});

function onDownload() {
  io.downloadAsJson();
}

function onSave() {
  io.saveToLocalStorage();
  send({ message: "Scenario saved to local storage" });
}

function onLoad() {
  io.loadFromLocalStorage();
  send({ message: "Scenario loaded from local storage" });
}

function onFormSubmit() {
  const {
    state: { info },
  } = store;
  store.update((s) => {
    Object.assign(s.info, { ...form.value });
  });

  if (info.symbologyStandard) settingsStore.symbologyStandard = info.symbologyStandard;
  isEditMode.value = false;
}
</script>
