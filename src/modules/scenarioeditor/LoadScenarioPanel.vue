<template>
  <div
    ref="dropZoneRef"
    class="relative mt-4 h-40 w-full rounded-lg border-2 border-dashed p-4 ring-offset-2 focus-within:ring-2 hover:border-gray-500"
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
      class="flex h-full w-full cursor-pointer items-center justify-center hover:text-gray-700"
      ><p>Drag a file here or click to select local file</p></label
    >
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
