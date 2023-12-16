<template>
  <form class="space-y-4" @submit.prevent="fetchScenario">
    <InputGroup v-model="scenarioUrl" label="URL" />
    <p class="text-sm">
      Please note that the scenario host must be configured to allow CORS requests.
    </p>

    <p v-if="isError" class="text-sm text-red-600">
      {{ errorMessage }}
    </p>
    <p class="flex justify-end">
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

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  url: { type: String, default: "" },
});

const emit = defineEmits(["loaded"]);

const scenarioUrl = ref(props.url);
const isError = ref(false);
const errorMessage = ref("");
const isValidUrl = computed(() => isUrl(scenarioUrl.value));

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
</script>
