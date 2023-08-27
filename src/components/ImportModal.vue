<template>
  <SimpleModal v-model="open" dialog-title="Import data" @cancel="onCancel">
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
  </SimpleModal>
</template>

<script setup lang="ts">
import SimpleModal from "./SimpleModal.vue";
import { useNotifications } from "@/composables/notifications";
import { useRouter } from "vue-router";
import { useVModel } from "@vueuse/core";
import ImportLoadStep from "@/components/ImportLoadStep.vue";
import { ref, shallowRef } from "vue";
import ImportMilxStep from "@/components/ImportMilxStep.vue";
import ImportGeojsonStep from "@/components/ImportGeojsonStep.vue";
import ImportSpatialIllusionsStep from "@/components/ImportSpatialIllusionsStep.vue";
import { OrbatGeneratorOrbat, SpatialIllusionsOrbat } from "@/types/externalModels";
import type { FeatureCollection } from "geojson";
import { MilxImportedLayer } from "@/composables/scenarioImport";
import ImportOrbatGeneratorStep from "@/components/ImportOrbatGeneratorStep.vue";
import ImportImageStep from "@/components/ImportImageStep.vue";
import { ImportedFileInfo } from "@/lib/fileHandling";
import ImportKMLStep from "@/components/ImportKMLStep.vue";

const router = useRouter();

type ImportState =
  | "select"
  | "milx"
  | "geojson"
  | "unitgenerator"
  | "orbatgenerator"
  | "image"
  | "kml";
const importState = ref<ImportState>("select");
const loadedData = shallowRef<any>([]);
const fileInfo = shallowRef<ImportedFileInfo>();
const props = withDefaults(defineProps<{ modelValue: boolean }>(), { modelValue: false });
const emit = defineEmits(["update:modelValue", "cancel"]);
const { send } = useNotifications();

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
