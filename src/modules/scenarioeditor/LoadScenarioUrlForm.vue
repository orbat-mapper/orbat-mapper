<template>
  <form class="space-y-4" @submit.prevent="fetchScenario">
    <InputGroup v-model="scenarioUrl" label="URL" />
    <p class="text-sm">
      Please note that the scenario host must be configured to allow CORS requests.
    </p>

    <p v-if="isError" class="text-sm text-red-600">
      {{ errorMessage }}
    </p>
    <p v-if="sharableUrl" class="prose prose-sm">
      <a :href="sharableUrl" target="_blank">{{ sharableUrl }}</a>
      <BaseButton class="ml-2" small @click="copy(sharableUrl)"
        >Copy to clipboard</BaseButton
      >
    </p>
    <p class="flex justify-end space-x-2">
      <BaseButton type="button" small @click="createSharableUrl()"
        >Create sharable URL</BaseButton
      >
      <BaseButton type="submit" primary small>Load from URL</BaseButton>
    </p>
  </form>
</template>

<script setup lang="ts">
import { Scenario } from "@/types/scenarioModels";
import InputGroup from "@/components/InputGroup.vue";
import { computed, ref } from "vue";
import BaseButton from "@/components/BaseButton.vue";
import { isUrl } from "@/utils";
import { useClipboard } from "@vueuse/core";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  url: { type: String, default: "" },
});

const emit = defineEmits(["loaded"]);

const scenarioUrl = ref(props.url);
const isError = ref(false);
const errorMessage = ref("");
const isValidUrl = computed(() => isUrl(scenarioUrl.value));
const sharableUrl = ref("");

const { copy } = useClipboard();

async function fetchScenario() {
  const url = scenarioUrl.value;
  if (!isValidUrl.value) {
    isError.value = true;
    errorMessage.value = `The url ${url} is not a valid url.`;
    return;
  }
  try {
    const response = await fetch(url);
    const jsonData = (await response.json()) as Scenario;
    if (jsonData?.type === "ORBAT-mapper") {
      emit("loaded", jsonData);
    } else {
      isError.value = true;
      errorMessage.value = `The url ${url} is not a valid scenario file.`;
    }
  } catch (e: any) {
    console.error("Failed to load", url);
    isError.value = true;
    errorMessage.value = `Failed to load ${url}: ${e?.message}`;
  }
}

function createSharableUrl() {
  const url = new URL(window.location.href);
  url.searchParams.set("loadScenarioURL", scenarioUrl.value);
  sharableUrl.value = url.toString();

  navigator.clipboard.writeText(url.toString());
}
</script>
