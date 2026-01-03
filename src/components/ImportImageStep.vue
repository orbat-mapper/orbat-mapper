<script setup lang="ts">
import { injectStrict, nanoid } from "@/utils";
import { activeScenarioKey, searchActionsKey } from "@/components/injects";
import { computed, ref } from "vue";
import { type ImportedFileInfo } from "@/importexport/fileHandling";
import { stripFileExtension } from "@/utils/files";
import AlertWarning from "@/components/AlertWarning.vue";
import { Button } from "@/components/ui/button";
import {
  Field,
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

const form = ref({
  layerName: stripFileExtension(props.fileInfo.fileName),
});

const imageWidth = ref(0);
const imageHeight = ref(0);

const isBlob = computed(() => {
  return props.objectUrl.startsWith("blob:");
});

async function onLoad(e: Event) {
  const newLayer = geo.addMapLayer({
    url: props.objectUrl,
    name: form.value.layerName,
    id: nanoid(),
    type: "ImageLayer",
  });
  await onImageLayerSelectHook.trigger({ layerId: newLayer.id });
  emit("loaded");
}

function onCancel() {
  if (props.objectUrl) {
    URL.revokeObjectURL(props.objectUrl);
  }
  emit("cancel");
}

function onImageLoad(e: Event) {
  const target = e.target as HTMLImageElement;
  imageWidth.value = target.naturalWidth;
  imageHeight.value = target.naturalHeight;
}
</script>

<template>
  <div class="">
    <form @submit.prevent="onLoad" class="mt-4 flex max-h-[80vh] min-h-100 flex-col">
      <FieldGroup>
        <FieldSet>
          <FieldLegend>Image import </FieldLegend>

          <AlertWarning v-if="isBlob" title="Warning"
            >This image is a local file and will not be saved with the scenario. It will
            only be visible while the scenario is open.
          </AlertWarning>

          <div class="flex-auto overflow-auto p-0.5">
            <img :src="objectUrl" @load="onImageLoad" />
            <p v-if="imageWidth" class="text-muted-foreground mt-2 text-sm">
              Image dimensions {{ imageWidth }}x{{ imageHeight }}
            </p>
          </div>
          <Field>
            <FieldLabel for="layerName">Image layer name</FieldLabel>
            <Input id="layerName" v-model="form.layerName" />
          </Field>

          <Field orientation="horizontal" class="justify-end">
            <Button type="submit"> Import</Button>
            <Button variant="outline" type="button" @click="onCancel"> Cancel</Button>
          </Field>
        </FieldSet>
      </FieldGroup>
    </form>
  </div>
</template>
