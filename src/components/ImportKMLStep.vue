<script setup lang="ts">
import { injectStrict, nanoid } from "@/utils";
import { activeScenarioKey, searchActionsKey } from "@/components/injects";
import { ref } from "vue";
import { stripFileExtension } from "@/utils/files";
import AlertWarning from "@/components/AlertWarning.vue";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import ImportedFileList from "@/components/ImportedFileList.vue";
import type { KmlImportData } from "@/types/importExport.ts";

interface Props {
  objectUrl: string;
  loadedData: KmlImportData;
}

const props = defineProps<Props>();
const emit = defineEmits(["cancel", "loaded"]);
const { geo } = injectStrict(activeScenarioKey);
const { onImageLayerSelectHook } = injectStrict(searchActionsKey);

const form = ref({
  layerNames: props.loadedData.fileInfo.map((f) => stripFileExtension(f.fileName)),
  extractStyles: true,
});

async function onLoad(e: Event) {
  for (const data of props.loadedData.data) {
    const index = props.loadedData.data.indexOf(data);
    const layerName = form.value.layerNames[index] || `KML Layer ${index + 1}`;
    const newLayer = geo.addMapLayer({
      url: data,
      name: layerName,
      extractStyles: form.value.extractStyles,
      id: nanoid(),
      type: "KMLLayer",
    });

    await onImageLayerSelectHook.trigger({ layerId: newLayer.id });
  }

  emit("loaded");
}

function onCancel() {
  emit("cancel");
}
</script>

<template>
  <div class="">
    <form @submit.prevent="onLoad" class="flex max-h-[80vh] flex-col">
      <FieldGroup>
        <FieldSet>
          <FieldLegend>KML import</FieldLegend>
          <ImportedFileList :importData="loadedData" />
          <Field v-for="(name, index) in form.layerNames" :key="index">
            <FieldLabel for="layerName">Vector layer name</FieldLabel>
            <Input id="layerName" v-model="form.layerNames[index]" />
            <FieldDescription>{{
              loadedData.fileInfo[index]?.fileName
            }}</FieldDescription>
          </Field>

          <AlertWarning title="Warning"
            >KML layers are currently only visible while the scenario is open. They are
            not saved as part of the scenario.
          </AlertWarning>

          <Field orientation="horizontal" class="justify-end">
            <Button type="submit"> Import</Button>
            <Button variant="outline" type="button" @click="onCancel"> Cancel</Button>
          </Field>
        </FieldSet></FieldGroup
      >
    </form>
  </div>
</template>
