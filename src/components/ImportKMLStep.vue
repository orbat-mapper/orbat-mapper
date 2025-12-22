<script setup lang="ts">
import { injectStrict, nanoid } from "@/utils";
import { activeScenarioKey, searchActionsKey } from "@/components/injects";
import { ref } from "vue";
import type { ImportedFileInfo } from "@/importexport/fileHandling";
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

interface Props {
  objectUrl: string;
  fileInfo: ImportedFileInfo;
}

const props = defineProps<Props>();
const emit = defineEmits(["cancel", "loaded"]);
const { geo } = injectStrict(activeScenarioKey);
const { onImageLayerSelectHook } = injectStrict(searchActionsKey);

type InputOption = "imageLayer";

const inputOption = ref<InputOption>("imageLayer");

const form = ref({
  layerName: stripFileExtension(props.fileInfo.fileName),
  extractStyles: true,
});

async function onLoad(e: Event) {
  const newLayer = geo.addMapLayer({
    url: props.objectUrl,
    name: form.value.layerName,
    extractStyles: form.value.extractStyles,
    id: nanoid(),
    type: "KMLLayer",
  });
  await onImageLayerSelectHook.trigger({ layerId: newLayer.id });
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
          <FieldDescription>You have loaded a KML file.</FieldDescription>
          <Field>
            <FieldLabel for="layerName">Vector layer name</FieldLabel>
            <Input id="layerName" v-model="form.layerName" />
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
