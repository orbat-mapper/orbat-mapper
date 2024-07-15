<!--suppress JSDeprecatedSymbols -->
<script setup lang="ts">
import SimpleModal from "./SimpleModal.vue";
import { useVModel } from "@vueuse/core";
import ImportLoadStep from "@/components/ImportLoadStep.vue";
import { defineAsyncComponent, ref, shallowRef } from "vue";
import { OrbatGeneratorOrbat, SpatialIllusionsOrbat } from "@/types/externalModels";
import type { FeatureCollection } from "geojson";
import { MilxImportedLayer } from "@/composables/scenarioImport";
import ImportImageStep from "@/components/ImportImageStep.vue";
import { ImportedFileInfo } from "@/importexport/fileHandling";

const ImportGeojsonStep = defineAsyncComponent(
  () => import("@/components/ImportGeojsonStep.vue"),
);

const ImportSpatialIllusionsStep = defineAsyncComponent(
  () => import("@/components/ImportSpatialIllusionsStep.vue"),
);

const ImportOrbatGeneratorStep = defineAsyncComponent(
  () => import("@/components/ImportOrbatGeneratorStep.vue"),
);

const ImportMilxStep = defineAsyncComponent(
  () => import("@/components/ImportMilxStep.vue"),
);
const ImportKMLStep = defineAsyncComponent(
  () => import("@/components/ImportKMLStep.vue"),
);
const ImportSpreadsheetStep = defineAsyncComponent(
  () => import("@/components/ImportSpreadsheetStep.vue"),
);

type ImportState =
  | "select"
  | "milx"
  | "geojson"
  | "unitgenerator"
  | "orbatgenerator"
  | "image"
  | "kml"
  | "xlsx";
const importState = ref<ImportState>("select");
const loadedData = shallowRef<any>([]);
const fileInfo = shallowRef<ImportedFileInfo>();
const props = withDefaults(defineProps<{ modelValue: boolean }>(), { modelValue: false });
const emit = defineEmits(["update:modelValue", "cancel"]);

const open = useVModel(props, "modelValue", emit);

function onLoaded(nextState: ImportState, data: any, info: ImportedFileInfo) {
  loadedData.value = data;
  importState.value = nextState;
  fileInfo.value = info;
}

function onImport() {
  open.value = false;
}

function onCancel() {
  open.value = false;
  const objectUrlStates = ["image", "kml"];
  if (objectUrlStates.includes(importState.value) && loadedData.value !== undefined) {
    URL.revokeObjectURL(loadedData.value);
  }
  emit("cancel");
}
</script>

<template>
  <SimpleModal
    v-model="open"
    dialog-title="Import data"
    @cancel="onCancel"
    maxWidth="sm:max-w-xl md:max-w-4xl"
  >
    <p class="text-sm leading-6 text-gray-500">Import data for use in your scenario</p>
    <ImportLoadStep
      v-if="importState === 'select'"
      @cancel="onCancel"
      @loaded="onLoaded"
    />
    <ImportMilxStep
      v-else-if="importState === 'milx'"
      @cancel="onCancel"
      :data="loadedData as MilxImportedLayer[]"
      @loaded="onImport"
    />
    <ImportGeojsonStep
      v-else-if="importState === 'geojson'"
      @cancel="onCancel"
      :data="loadedData as FeatureCollection"
      @loaded="onImport"
    />
    <ImportSpatialIllusionsStep
      v-else-if="importState === 'unitgenerator'"
      @cancel="onCancel"
      :data="loadedData as SpatialIllusionsOrbat"
      @loaded="onImport"
    />
    <ImportOrbatGeneratorStep
      v-else-if="importState === 'orbatgenerator'"
      @cancel="onCancel"
      :data="loadedData as OrbatGeneratorOrbat"
      @loaded="onImport"
    />
    <ImportImageStep
      v-else-if="importState === 'image' && fileInfo"
      :object-url="loadedData as string"
      :file-info="fileInfo"
      @cancel="onCancel"
      @loaded="onImport"
    />
    <ImportKMLStep
      v-else-if="importState === 'kml' && fileInfo"
      :object-url="loadedData"
      :file-info="fileInfo"
      @cancel="onCancel"
      @loaded="onImport"
    />
    <ImportSpreadsheetStep
      v-else-if="importState === 'xlsx' && fileInfo"
      :file-info="fileInfo"
      @cancel="onCancel"
      @loaded="onImport"
    />
  </SimpleModal>
</template>
