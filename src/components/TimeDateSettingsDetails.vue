<script setup lang="ts">
import RadioGroupList from "@/components/RadioGroupList.vue";
import LanguageSelect from "@/components/LanguageSelect.vue";
import InputGroupTemplate from "@/components/InputGroupTemplate.vue";
import SimpleSelect from "@/components/SimpleSelect.vue";
import {
  intlItems,
  timeFormatItems,
  type TimeFormatSettings,
} from "@/stores/timeFormatStore";

const props = defineProps<{ sampleTime: string }>();
const settings = defineModel<TimeFormatSettings>({ required: true });
const browserLocale = navigator.language;

const languageNames = new Intl.DisplayNames(["en"], { type: "language" });
const browserLanguageName = languageNames.of(browserLocale);
</script>

<template>
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

      <div class="grid grid-cols-2 gap-4">
        <SimpleSelect
          label="Date style"
          v-model="settings.dateStyle"
          :items="intlItems"
        />
        <SimpleSelect
          label="Time style"
          v-model="settings.timeStyle"
          :items="intlItems"
        />
      </div>
    </template>

    <p class="text-sm font-semibold">Preview:</p>
    <p>{{ sampleTime }}</p>
  </div>
</template>
