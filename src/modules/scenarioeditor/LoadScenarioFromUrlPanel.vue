<template>
  <div
    class="border-border focus-within:ring-ring hover:border-border/80 relative w-full rounded-lg border-2 border-dashed p-4 ring-offset-2 focus-within:ring-2"
    @dragover.prevent
    @drop.prevent="onDrop"
  >
    <button
      class="text-foreground hover:text-muted-foreground flex h-full w-full cursor-pointer flex-col items-center justify-center text-sm font-medium"
      @click="toggleModal()"
    >
      <IconWebPlus class="text-muted-foreground h-10 w-10" />

      <span class="mt-2 block text-center">Load from URL</span>
    </button>

    <p
      v-if="isError"
      class="text-destructive-foreground absolute bottom-2 left-0 w-full text-center text-base"
    >
      Please select a valid scenario file.
    </p>
    <NewSimpleModal v-model="showModal" dialog-title="Load scenario from URL">
      <LoadScenarioUrlForm
        class="mt-4"
        @loaded="emit('loaded', $event)"
        :url="initialUrl"
      />
    </NewSimpleModal>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useToggle } from "@vueuse/core";
import { type Scenario } from "@/types/scenarioModels";
import { isUrl } from "@/utils";
import { IconWebPlus } from "@iconify-prerendered/vue-mdi";
import LoadScenarioUrlForm from "@/modules/scenarioeditor/LoadScenarioUrlForm.vue";
import { useRoute } from "vue-router";
import NewSimpleModal from "@/components/NewSimpleModal.vue";

const emit = defineEmits(["update:modelValue", "loaded"]);

const [showModal, toggleModal] = useToggle(false);
const isError = ref(false);
const route = useRoute();

const initialUrl = ref("");

onMounted(() => {
  const loadScenarioURL = (route.query.loadScenarioURL as string) ?? "";
  if (loadScenarioURL) {
    initialUrl.value = loadScenarioURL;
    showModal.value = true;
  }
});

async function fetchScenario(url: string) {
  try {
    const response = await fetch(url);
    const jsonData = (await response.json()) as Scenario;
    if (jsonData?.type === "ORBAT-mapper") {
      emit("loaded", jsonData);
    }
  } catch (e) {
    console.error("Failed to load", url);
  }
}

async function onDrop(e: DragEvent) {
  e.preventDefault();
  e.stopPropagation();
  const possibleURL = e.dataTransfer?.getData("text/uri-list");
  if (possibleURL && isUrl(possibleURL)) {
    //load json from url fetch async
    await fetchScenario(possibleURL);
  }
}
</script>
