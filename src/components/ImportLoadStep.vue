<template>
  <form @submit.prevent="onLoad" class="mt-4 space-y-6" ref="dropZoneRef">
    <fieldset class="space-y-4">
      <RadioGroup v-model="store.inputSource" class="flex items-center space-x-8">
        <RadioGroupLabel class="text-sm font-medium text-gray-700"
          >Input source</RadioGroupLabel
        >
        <RadioGroupOption v-slot="{ checked }" value="file">
          <span
            :class="[
              checked
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-500 hover:text-gray-700',
              'cursor-pointer rounded-md px-3 py-2 text-sm font-medium',
            ]"
            >Local file</span
          >
        </RadioGroupOption>
        <RadioGroupOption v-slot="{ checked }" value="string">
          <span
            :class="[
              checked
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-500 hover:text-gray-700',
              'cursor-pointer rounded-md px-3 py-2 text-sm font-medium',
            ]"
            >Paste text</span
          >
        </RadioGroupOption>
      </RadioGroup>
      <div
        v-if="store.inputSource === 'file'"
        class="mt-4 h-24 w-full rounded-lg border-2 border-dashed p-4 ring-offset-2 focus-within:ring-2 hover:border-gray-500"
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
          class="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2 hover:text-gray-700"
        >
          <p class="text-base">Drag a file here or click to select local file</p>
          <p v-if="currentFilename" class="text-sm">
            Current file
            <span class="font-mono text-blue-800">{{ currentFilename }}</span>
          </p>
        </label>
      </div>
      <div v-else class="min-h-[6rem]">
        <TextAreaGroup rows="3" v-model="stringSource" />
      </div>
    </fieldset>
    <SimpleSelect
      label="Select import format"
      :items="formatItems"
      v-model="form.format"
    />
    <div class="prose-sm prose">
      <p v-if="isMilx">
        Basic support for importing MilX layers from
        <a href="https://www.map.army/">map.army</a>
      </p>
      <p v-if="isGeojson">Import units and features.</p>
    </div>
    <p v-if="isMilx" class="prose-sm prose">
      Please note that the import functionality is experimental.
    </p>

    <footer class="flex items-center justify-end space-x-2 pt-4">
      <BaseButton type="submit" primary small :disabled="!currentFilename"
        >Load</BaseButton
      >
      <BaseButton small @click="emit('cancel')">Cancel</BaseButton>
    </footer>
  </form>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import BaseButton from "@/components/BaseButton.vue";
import SimpleSelect from "@/components/SimpleSelect.vue";
import { SelectItem } from "@/components/types";
import { RadioGroup, RadioGroupLabel, RadioGroupOption } from "@headlessui/vue";
import type { ImportFormat, ImportSettings } from "@/types/convert";
import { useNotifications } from "@/composables/notifications";
import NProgress from "nprogress";
import { useRouter } from "vue-router";
import { useDropZone } from "@vueuse/core";
import TextAreaGroup from "@/components/TextAreaGroup.vue";
import { useImportStore } from "@/stores/importExportStore";
import { unzip, useScenarioImport } from "@/composables/scenarioImport";
import type { Unzipped } from "fflate";

const router = useRouter();

const emit = defineEmits(["cancel", "loaded"]);

const formatItems: SelectItem<ImportFormat>[] = [
  { label: "MilX", value: "milx" },
  { label: "GeoJSON", value: "geojson" },
  // { label: "MSDL", value: "msdl" },
];

const stringSource = ref("");
const currentFilename = ref("");

const store = useImportStore();

const dropZoneRef = ref<HTMLDivElement>();
const { isOverDropZone } = useDropZone(dropZoneRef, onDrop);

interface Form extends ImportSettings {
  format: ImportFormat;
}

const form = ref<Form>({
  format: store.format,
  includeFeatures: false,
  includeUnits: true,
  fileName: "scenario.geojson",
  embedIcons: true,
  useShortName: true,
});

const { send } = useNotifications();

const isMilx = computed(() => form.value.format === "milx");
const isGeojson = computed(() => form.value.format === "geojson");
const { importMilxString, importGeojsonString } = useScenarioImport();

async function onLoad(e: Event) {
  const { format } = form.value;

  NProgress.start();
  if (format === "milx" && stringSource.value) {
    const data = await importMilxString(stringSource.value);
    send({ message: `Loaded data as ${format}` });
    NProgress.done();
    emit("loaded", "milx", data);
  }
  if (format === "geojson" && stringSource.value) {
    const data = importGeojsonString(stringSource.value);
    send({ message: `Loaded data as ${format}` });
    NProgress.done();
    emit("loaded", "geojson", data);
  }

  NProgress.done();
  // open.value = false;
}

function onDrop(files: File[] | null) {
  if (files) {
    handleFiles(files);
  }
}

const onFileLoad = (e: Event) => {
  const target = <HTMLInputElement>e.target;
  if (!target?.files?.length) return;
  const files = Array.from(target.files);
  handleFiles(files);
};

async function handleFiles(files: File[]) {
  const file = files[0];
  currentFilename.value = file.name;
  if (isZipped(file)) {
    try {
      const unzipped = await readZippedFile(file);
      const f = Object.entries(unzipped).find(([filename]) =>
        filename.endsWith(".milxly")
      );
      if (f) {
        const text = arrayBufferToString(f[1]);
        stringSource.value = text;
      }
    } catch (e) {
      console.error(e);
      send({ message: `Failed to unzip file: ${e}` });
      return;
    }
  } else {
    try {
      const text = await file.text();
      stringSource.value = text;
    } catch (e) {
      console.error(e);
    }
  }
}

function isZipped(file: File): boolean {
  const zippedTypes = ["application/vnd.google-earth.kmz", "application/zip"];
  if (zippedTypes.includes(file.type)) return true;
  if (file.name.endsWith(".kmz")) return true;
  return file.name.endsWith(".milxlyz");
}

function arrayBufferToString(arrayBuffer: ArrayBuffer, decoderType = "utf-8") {
  let decoder = new TextDecoder(decoderType);
  return decoder.decode(arrayBuffer);
}

async function readZippedFile(file: File): Promise<Unzipped> {
  const data = await file.arrayBuffer();
  return unzip(data);
}

function readFileAsync(file: File): Promise<ArrayBuffer | null | string> {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result);
    };

    reader.onerror = reject;

    reader.readAsArrayBuffer(file);
  });
}
</script>
