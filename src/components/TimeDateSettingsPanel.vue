<script setup lang="ts">
import PanelHeading from "@/components/PanelHeading.vue";
import { RadioGroupItem } from "@/components/types";
import HeadingDesciption from "@/components/HeadingDescription.vue";
import { computed } from "vue";
import RadioGroupList from "@/components/RadioGroupList.vue";
import {
  TimeFormat,
  useTimeFormatSettingsStore,
  useTimeFormatStore,
} from "@/stores/timeFormatStore";
import { useActiveScenario } from "@/composables/scenarioUtils";
import LanguageSelect from "@/components/LanguageSelect.vue";
import SimpleSelect from "@/components/SimpleSelect.vue";
import InputGroupTemplate from "@/components/InputGroupTemplate.vue";

const {
  time: { timeZone },
  store,
} = useActiveScenario();

const timeFormatItems: RadioGroupItem<TimeFormat>[] = [
  { name: "ISO 8601", value: "iso" },
  { name: "Localized", value: "local" },
  { name: "Military DTG", value: "military" },
];

const currentTime = store.state.currentTime;
const settings = useTimeFormatSettingsStore();
const fmt = useTimeFormatStore();
const sampleTime = computed(() => {
  return fmt.pathFormatter.format(currentTime);
});

const browserLocale = navigator.language;

const languageNames = new Intl.DisplayNames(["en"], { type: "language" });
const browserLanguageName = languageNames.of(browserLocale);

const llItems = [
  { label: "Full", value: "full" },
  { label: "Long", value: "long" },
  { label: "Medium", value: "medium" },
  { label: "Short", value: "short" },
];
</script>
<template>
  <PanelHeading>Time and date</PanelHeading>
  <HeadingDesciption
    >Choose how you want to format the scenario's time and date.</HeadingDesciption
  >

  <div class="space-y-4">
    <RadioGroupList v-model="settings.timeFormat" :items="timeFormatItems" />
    <template v-if="settings.timeFormat === 'local'">
      <p class="text-sm"></p>
      <InputGroupTemplate label="Language">
        <LanguageSelect v-model="settings.locale" />
        <template #description>
          Browser locale is
          <span class="font-medium">{{ browserLanguageName }}({{ browserLocale }})</span>
        </template>
      </InputGroupTemplate>

      <SimpleSelect label="Date style" v-model="settings.dateStyle" :items="llItems" />
      <SimpleSelect label="Time style" v-model="settings.timeStyle" :items="llItems" />
    </template>

    <p class="text-sm font-semibold">Preview:</p>
    <p>{{ sampleTime }}</p>
  </div>
</template>
