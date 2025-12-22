<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from "vue";
import { AlertCircleIcon } from "lucide-vue-next";
import SimpleSelect from "@/components/SimpleSelect.vue";
import { type SelectItem } from "@/components/types";
import type { GuessedImportFormat, ImportFormat, ImportSettings } from "@/types/convert";
import { useNotifications } from "@/composables/notifications";
import NProgress from "nprogress";
import { useDropZone } from "@vueuse/core";
import { useImportStore } from "@/stores/importExportStore";
import { useScenarioImport } from "@/composables/scenarioImport";
import { guessImportFormat, type ImportedFileInfo } from "@/importexport/fileHandling";
import { useDragStore } from "@/stores/dragStore";
import type { OrbatGeneratorOrbat, SpatialIllusionsOrbat } from "@/types/externalModels";
import DocLink from "@/components/DocLink.vue";
import { isUrl } from "@/utils";
import type { FeatureCollection } from "geojson";
import ImportLoadStepBrowser from "@/modules/scenarioeditor/ImportLoadStepBrowser.vue";
import { type Scenario } from "@/types/scenarioModels";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

const emit = defineEmits(["cancel", "loaded"]);

const formatItems: SelectItem<ImportFormat>[] = [
  { label: "MilX", value: "milx" },
  { label: "GeoJSON", value: "geojson" },
  { label: "Spatial Illusions ORBAT builder", value: "unitgenerator" },
  { label: "Order of Battle Generator", value: "orbatgenerator" },
  { label: "KML/KMZ", value: "kml" },
  { label: "XLSX", value: "xlsx" },
];

const sourceItems: SelectItem<string>[] = [
  { label: "Local file", value: "file" },
  { label: "URL", value: "url" },
  { label: "Browser", value: "browser" },
  { label: "Paste text", value: "string" },
];

const stringSource = ref("");
const urlSource = ref("");
const currentFilename = ref("");
const objectUrl = ref("");
const fileInfo = shallowRef<ImportedFileInfo>();
const isError = ref(false);
const errorMessage = ref("");

const store = useImportStore();
const dragStore = useDragStore();

const dropZoneRef = ref<HTMLDivElement>();
const { isOverDropZone } = useDropZone(dropZoneRef, onDrop);

interface Form extends ImportSettings {
  format: ImportFormat;
}

const guessedFormat = ref<GuessedImportFormat>("unknown");

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
const isUnitGenerator = computed(() => form.value.format === "unitgenerator");
const isOrbatGenerator = computed(() => form.value.format === "orbatgenerator");
const { importMilxString, importJsonString } = useScenarioImport();

async function onBrowserLoad(data: Scenario) {
  fileInfo.value = {
    format: "orbatmapper",
    dataAsString: "",
    objectUrl: "",
    isInvalid: false,
    errors: [],
    dialect: "unknown",
    isZipped: false,
    isJson: false,
    fileName: "indexed-db",
    hasMultipleFiles: false,
    fileSize: 0,
  };
  emit("loaded", "orbatmapper", data, fileInfo.value);
}

async function onLoad() {
  const { format } = form.value;

  NProgress.start();

  if (format === "milx" && stringSource.value) {
    const data = await importMilxString(stringSource.value);
    send({ message: `Loaded data as ${format}` });
    NProgress.done();
    emit("loaded", "milx", data, fileInfo.value);
  }

  if (format === "kml" && stringSource.value) {
    send({ message: `Loaded data as ${format}` });
    NProgress.done();
    emit("loaded", "kml", objectUrl.value, fileInfo.value);
  }

  if (format === "image" && objectUrl.value) {
    send({ message: `Loaded data as ${format}` });
    NProgress.done();
    emit("loaded", "image", objectUrl.value, fileInfo.value);
  }

  if (format === "geojson" && stringSource.value) {
    const data = importJsonString<FeatureCollection>(stringSource.value);
    send({ message: `Loaded data as ${format}` });
    NProgress.done();
    emit("loaded", "geojson", data, fileInfo.value);
  }

  if (format === "unitgenerator" && stringSource.value) {
    const data = importJsonString<SpatialIllusionsOrbat>(stringSource.value);
    send({ message: `Loaded data as ${format}` });
    NProgress.done();
    console.log(data);
    emit("loaded", "unitgenerator", data, fileInfo.value);
  }

  if (format === "orbatgenerator" && stringSource.value) {
    const data = importJsonString<OrbatGeneratorOrbat>(stringSource.value);
    send({ message: `Loaded data as ${format}` });
    NProgress.done();
    emit("loaded", "orbatgenerator", data, fileInfo.value);
  }

  if (format === "orbatmapper" && stringSource.value) {
    const data = importJsonString<OrbatGeneratorOrbat>(stringSource.value);
    NProgress.done();
    emit("loaded", "orbatmapper", data, fileInfo.value);
  }

  if (format === "xlsx" && stringSource.value) {
    send({ message: `Loaded data as ${format}` });

    emit("loaded", "xlsx", stringSource.value, fileInfo.value);
  }

  NProgress.done();
}

function onDrop(files: File[] | null) {
  if (files) {
    handleFiles(files);
    dragStore.draggedFiles = null;
  }
}

const onFileLoad = (e: Event) => {
  const target = <HTMLInputElement>e.target;
  if (!target?.files?.length) return;
  const files = Array.from(target.files);
  handleFiles(files);
};

const onUrlLoad = async () => {
  const url = urlSource.value;
  if (!url) return;
  if (!isUrl(url)) {
    isError.value = true;
    errorMessage.value = `The url ${url} is not a valid url.`;
    return;
  }

  try {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const file = new File([buffer], url.split("/").pop() || "", {
      type: response.headers.get("Content-Type") || "",
    });
    await handleFiles([file]);
  } catch (e: any) {
    send({ message: `Failed to load ${url}: ${e?.message}` });
    isError.value = true;
    errorMessage.value = `Failed to load ${url}: ${e?.message}`;
  }
};

async function handleFiles(files: File[]) {
  const file = files[0];

  currentFilename.value = file.name;
  const info = await guessImportFormat(file);
  fileInfo.value = info;
  if (info.isInvalid) {
    info.errors.forEach((message) => send({ message }));
    return;
  }

  stringSource.value = info.dataAsString;
  objectUrl.value = info.objectUrl;
  guessedFormat.value = info.format;
  if (info.format !== "unknown") {
    form.value.format = info.format;
    await onLoad();
  }
}

onMounted(() => {
  if (dragStore.draggedFiles) onDrop(dragStore.draggedFiles);
});
</script>

<template>
  <form @submit.prevent="onLoad" class="mt-4 space-y-6" ref="dropZoneRef">
    <FieldGroup class="">
      <SimpleSelect
        class="sm:hidden"
        label="Input source"
        :items="sourceItems"
        v-model="store.inputSource"
      >
      </SimpleSelect>
      <FieldSet class="hidden sm:flex">
        <FieldLabel>Input source</FieldLabel>
        <RadioGroup v-model="store.inputSource" class="flex">
          <Field v-for="item in sourceItems" orientation="horizontal" :key="item.value">
            <RadioGroupItem :id="item.value" :value="item.value" />
            <FieldLabel :for="item.value" class="font-normal">
              {{ item.label }}
            </FieldLabel>
          </Field>
        </RadioGroup>
      </FieldSet>
      <FieldSeparator />
      <div
        v-if="store.inputSource === 'file'"
        class="hover:border-muted-foreground relative h-24 w-full rounded-lg border-2 border-dashed p-4 ring-offset-2 focus-within:ring-2"
        :class="isOverDropZone ? 'cursor-crosshair border-green-500' : ''"
      >
        <input
          type="file"
          id="file"
          @change="onFileLoad"
          class="absolute inset-0 opacity-0"
        />
        <label
          for="file"
          class="hover:text-accent-foreground flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2"
        >
          <span class="text-base">Drag a file here or click to select local file</span>
          <span v-if="currentFilename" class="text-sm">
            Current file
            <span class="text-accent-foreground font-mono">{{ currentFilename }}</span>
          </span>
        </label>
      </div>
      <Field v-else-if="store.inputSource === 'string'">
        <FieldLabel for="rawText">Raw text</FieldLabel>
        <Textarea id="rawText" :rows="4" />
        <FieldDescription
          >Paste any of the supported text based sources into the text
          field</FieldDescription
        >
      </Field>
      <Field v-else-if="store.inputSource === 'url'">
        <FieldLabel for="urlSource">URL</FieldLabel>
        <div class="flex gap-2">
          <Input id="urlSource" v-model="urlSource" type="text" />
          <div class="shrink-0">
            <Button variant="outline" @click="onUrlLoad">Load from URL</Button>
          </div>
        </div>
        <FieldDescription>
          Please note that the scenario host must be configured to allow CORS
          requests.</FieldDescription
        >
      </Field>
      <div v-else-if="store.inputSource === 'browser'" class="">
        <ImportLoadStepBrowser @loaded="onBrowserLoad" />
      </div>
    </FieldGroup>
    <Alert v-if="isError && errorMessage" variant="destructive" class="mt-2">
      <AlertCircleIcon />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{{ errorMessage }}</AlertDescription>
    </Alert>
    <div v-if="stringSource" class="space-y-4">
      <p v-if="guessedFormat" class="text-sm">
        The format seems to be
        <span class="text-accent-foreground">{{ guessedFormat }}.</span>
      </p>
      <SimpleSelect
        label="Select import format"
        :items="formatItems"
        v-model="form.format"
      >
        <template #hint>
          <DocLink href="https://docs.orbat-mapper.app/guide/import-data" />
        </template>
      </SimpleSelect>
      <div class="prose prose-sm">
        <p v-if="isMilx">
          Basic support for importing MilX layers from
          <a href="https://www.map.army/">map.army</a>
        </p>
        <p v-else-if="isGeojson">Import units and features.</p>
        <p v-else-if="isUnitGenerator">
          Import ORBAT generated with
          <a href="https://spatialillusions.com/unitgenerator2/" target="_blank"
            >Spatial Illusions Orbat builder</a
          >.
        </p>
        <p v-else-if="isOrbatGenerator">
          Import ORBAT generated with
          <a href="https://www.orbatgenerator.com/" target="_blank"
            >Order of Battle Generator</a
          >.
        </p>
      </div>
      <p v-if="isMilx" class="prose prose-sm">
        Please note that the import functionality is experimental.
      </p>
    </div>
    <img v-if="objectUrl" :src="objectUrl" alt="Loaded image" />
    <Field orientation="horizontal" class="justify-end">
      <Button type="submit"> Load </Button>
      <Button variant="outline" type="button" @click="emit('cancel')"> Cancel </Button>
    </Field>
  </form>
</template>
