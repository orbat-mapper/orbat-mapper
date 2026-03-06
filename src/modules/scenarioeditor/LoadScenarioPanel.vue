<script setup lang="ts">
import { ref } from "vue";
import { useDropZone } from "@vueuse/core";
import { useScenarioFileLoader } from "@/composables/useScenarioFileLoader";
import type { ImportedScenarioPayload } from "@/composables/importScenarioTransfer";

const emit = defineEmits(["update:modelValue", "loaded"]);

const dropZoneRef = ref<HTMLDivElement>();
const { fileInputRef, isError, loadFile, onFileChange, openFilePicker } =
  useScenarioFileLoader((scenario: ImportedScenarioPayload) => emit("loaded", scenario));

const { isOverDropZone } = useDropZone(dropZoneRef, (files: File[] | null) => {
  const file = files?.[0];
  if (file) {
    void loadFile(file);
  }
});
</script>

<template>
  <div
    ref="dropZoneRef"
    class="border-border hover:border-border/80 relative w-full rounded-lg border-2 border-dashed p-4 ring-offset-2 focus-within:ring-2"
    :class="isOverDropZone ? 'border-primary cursor-crosshair' : ''"
  >
    <input
      ref="fileInputRef"
      type="file"
      id="file"
      @change="onFileChange"
      class="absolute h-[0.1px] w-[0.1px] opacity-0"
    />
    <label
      for="file"
      class="text-foreground hover:text-muted-foreground flex h-full w-full cursor-pointer flex-col items-center justify-center text-sm font-medium"
      @click.prevent="openFilePicker"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1"
        stroke="currentColor"
        class="text-muted-foreground h-12 w-12"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
        />
      </svg>

      <span class="mt-2 block text-center"
        >Drag a file here or click to select local file</span
      >
    </label>

    <p
      v-if="isError"
      class="text-destructive-foreground absolute bottom-2 left-0 w-full text-center text-base"
    >
      Please select a valid scenario file.
    </p>
  </div>
</template>
