<!--suppress JSDeprecatedSymbols -->
<script setup lang="ts">
import ImportLoadStep from "@/components/ImportLoadStep.vue";
import { defineAsyncComponent, ref, shallowRef } from "vue";
import type { OrbatGeneratorOrbat, SpatialIllusionsOrbat } from "@/types/externalModels";
import type { FeatureCollection } from "geojson";
import type { MilxImportedLayer } from "@/composables/scenarioImport";
import ImportImageStep from "@/components/ImportImageStep.vue";
import type { ImportedFileInfo } from "@/importexport/fileHandling";
import NewSimpleModal from "@/components/NewSimpleModal.vue";
import type { ImportData } from "@/types/importExport.ts";

const ImportGeojsonStep = defineAsyncComponent(
  () => import("@/components/ImportGeojsonStep.vue"),
);

const DecryptScenarioModal = defineAsyncComponent(
  () => import("@/components/DecryptScenarioModal.vue"),
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

const ImportOrbatMapperStep = defineAsyncComponent(
  () => import("@/components/ImportOrbatMapperStep.vue"),
);

type ImportState =
  | "select"
  | "milx"
  | "geojson"
  | "unitgenerator"
  | "orbatgenerator"
  | "image"
  | "kml"
  | "xlsx"
  | "csv"
  | "tsv"
  | "orbatmapper"
  | "orbatmapper-encrypted";
const importState = ref<ImportState>("select");
const loadedData = shallowRef<any>([]);
const loadedImportData = shallowRef<ImportData>();
const fileInfo = shallowRef<ImportedFileInfo>();
const emit = defineEmits(["cancel"]);

const open = defineModel<boolean>({ default: false });
const showDecryptModal = ref(false);

function onLoaded(nextState: ImportState, data: any, info: ImportedFileInfo | undefined) {
  loadedData.value = data;
  if (nextState === "orbatmapper-encrypted") {
    showDecryptModal.value = true;
    return;
  }
  importState.value = nextState;
  fileInfo.value = info;
}

function onDecrypted(scenario: any) {
  showDecryptModal.value = false;
  loadedData.value = scenario;
  importState.value = "orbatmapper";
}

function onLod(importData: ImportData) {
  loadedImportData.value = importData;
  importState.value = importData.format;
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
  // clean up loadedImportData
  loadedImportData.value?.data.forEach((d) => {
    if (d instanceof String && d.startsWith("blob:")) {
      URL.revokeObjectURL(d as string);
    }
  });
  loadedImportData.value = undefined;

  emit("cancel");
}
</script>

<template>
  <NewSimpleModal
    v-model="open"
    fixed-height
    @cancel="onCancel"
    class="grid h-[90vh] grid-rows-[auto_1fr] sm:max-w-xl md:max-w-4xl lg:max-w-[95vw]"
  >
    <div class="-mx-6 flex h-full flex-col overflow-hidden px-0">
      <div class="min-h-0 flex-1 overflow-hidden">
        <ImportLoadStep
          v-if="importState === 'select'"
          @cancel="onCancel"
          @loaded="onLoaded"
          @lod="onLod"
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
          v-else-if="loadedImportData?.format === 'kml'"
          :loadedData="loadedImportData"
          @cancel="onCancel"
          @loaded="onImport"
        />
        <ImportSpreadsheetStep
          v-else-if="
            (importState === 'xlsx' || importState === 'csv' || importState === 'tsv') &&
            fileInfo
          "
          :file-info="fileInfo"
          @cancel="onCancel"
          @loaded="onImport"
        />
        <ImportOrbatMapperStep
          v-else-if="importState === 'orbatmapper'"
          :data="loadedData"
          @cancel="onCancel"
          @loaded="onImport"
        />
      </div>
    </div>
  </NewSimpleModal>
  <DecryptScenarioModal
    v-if="showDecryptModal && loadedData"
    v-model="showDecryptModal"
    :encrypted-scenario="loadedData"
    @decrypted="onDecrypted"
  />
</template>
