<script setup lang="ts">
import { type Scenario } from "@/types/scenarioModels";
import InputGroup from "@/components/InputGroup.vue";
import { computed, ref } from "vue";
import { isUrl } from "@/utils";
import { useClipboard } from "@vueuse/core";
import { Button } from "@/components/ui/button";

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

<template>
  <form class="space-y-4" @submit.prevent="fetchScenario">
    <InputGroup v-model="scenarioUrl" label="URL" />
    <p class="text-sm">
      Please note that the scenario host must be configured to allow CORS requests.
    </p>

    <p v-if="isError" class="text-sm text-red-600">
      {{ errorMessage }}
    </p>
    <div v-if="sharableUrl" class="prose prose-sm">
      <a :href="sharableUrl" target="_blank">{{ sharableUrl }}</a>
      <Button class="ml-2" variant="outline" size="sm" @click="copy(sharableUrl)"
        >Copy to clipboard
      </Button>
    </div>
    <p class="flex justify-end gap-2 pt-4">
      <Button type="button" variant="secondary" @click="createSharableUrl()"
        >Create sharable URL
      </Button>
      <Button type="submit">Load from URL</Button>
    </p>
  </form>
</template>
