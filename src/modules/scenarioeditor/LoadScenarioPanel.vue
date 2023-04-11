<template>
  <div
    ref="dropZoneRef"
    class="relative w-full rounded-lg border-2 border-dashed border-gray-300 p-4 ring-offset-2 focus-within:ring-2 hover:border-gray-500"
    :class="isOverDropZone ? 'cursor-crosshair border-green-500' : ''"
  >
    <input
      type="file"
      id="file"
      @change="onFileLoad"
      class="absolute h-[0.1px] w-[0.1px] opacity-0"
    />
    <label
      for="file"
      class="flex h-full w-full cursor-pointer flex-col items-center justify-center text-sm font-medium text-gray-900 hover:text-gray-700"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1"
        stroke="currentColor"
        class="h-12 w-12 text-gray-400"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
        />
      </svg>

      <p class="mt-2 text-center">Drag a file here or click to select local file</p>
    </label>

    <p
      v-if="isError"
      class="absolute bottom-2 left-0 w-full text-center text-base text-red-900"
    >
      Please select a valid scenario file.
    </p>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { useDropZone } from "@vueuse/core";
import { type Scenario } from "@/types/scenarioModels";

const emit = defineEmits(["update:modelValue", "loaded"]);

const dropZoneRef = ref<HTMLDivElement>();

const { isOverDropZone } = useDropZone(dropZoneRef, onDrop);
const isError = ref(false);

function readFile(file: File) {
  const reader = new FileReader();

  reader.onload = function (evt) {
    const content = evt?.target?.result as string;

    try {
      const scenarioData = JSON.parse(content) as Scenario;
      if (scenarioData?.type === "ORBAT-mapper") {
        emit("loaded", scenarioData);
      } else {
        console.error("Failed to load", file.name);
        isError.value = true;
      }
    } catch (e) {
      console.error("Failed to load", file.name);
      isError.value = true;
    }
  };
  reader.readAsText(file);
}

const onFileLoad = (e: Event) => {
  const target = <HTMLInputElement>e.target;
  if (!target?.files?.length) return;
  const file = target.files[0];
  if (file) readFile(file);
};

function onDrop(files: File[] | null) {
  const file = files && files[0];
  if (file) readFile(file);
}
</script>
