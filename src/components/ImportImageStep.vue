<script setup lang="ts">
import { injectStrict, nanoid } from "@/utils";
import { activeScenarioKey, searchActionsKey } from "@/components/injects";
import { computed, ref } from "vue";
import { type ImportedFileInfo } from "@/importexport/fileHandling";
import { stripFileExtension } from "@/utils/files";
import AlertWarning from "@/components/AlertWarning.vue";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import ImportStepLayout from "@/components/ImportStepLayout.vue";
import BaseButton from "@/components/BaseButton.vue";

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

async function onLoad() {
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
  <ImportStepLayout
    title="Import Image"
    help-url="https://docs.orbat-mapper.app/guide/import-data"
    has-sidebar
  >
    <template #actions>
      <BaseButton small @click="onCancel" class="flex-1 sm:flex-none">Cancel</BaseButton>
      <BaseButton primary small @click="onLoad" class="flex-1 sm:flex-none"
        >Import</BaseButton
      >
    </template>

    <template #sidebar>
      <Field>
        <FieldLabel for="layerName">Image layer name</FieldLabel>
        <Input id="layerName" v-model="form.layerName" />
      </Field>
    </template>

    <div class="space-y-4 p-6">
      <AlertWarning v-if="isBlob" title="Warning"
        >This image is a local file and will not be saved with the scenario. It will only
        be visible while the scenario is open.
      </AlertWarning>

      <div class="flex-auto overflow-auto p-0.5">
        <img :src="objectUrl" @load="onImageLoad" />
        <p v-if="imageWidth" class="text-muted-foreground mt-2 text-sm">
          Image dimensions {{ imageWidth }}x{{ imageHeight }}
        </p>
      </div>
    </div>
  </ImportStepLayout>
</template>
