<template>
  <div class="">
    <form @submit.prevent="onLoad" class="mt-4 flex max-h-[80vh] min-h-[25rem] flex-col">
      <div class="flex-auto overflow-auto p-0.5">
        <img :src="objectUrl" @load="onImageLoad" />
        <p v-if="imageWidth" class="text-sm">
          Image dimensions {{ imageWidth }}x{{ imageHeight }}
        </p>

        <section class="mt-4">
          <InputGroup label="Image layer name" v-model="form.layerName" />
        </section>
      </div>
      <AlertWarning v-if="isBlob" title="Warning"
        >This image is a local file and will not be saved with the scenario. It will only
        be visible while the scenario is open.
      </AlertWarning>

      <footer class="flex flex-shrink-0 items-center justify-end space-x-2 pt-4">
        <BaseButton type="submit" primary small>Import</BaseButton>
        <BaseButton small @click="onCancel()">Cancel</BaseButton>
      </footer>
    </form>
  </div>
</template>

<script setup lang="ts">
import BaseButton from "@/components/BaseButton.vue";
import { useImportStore } from "@/stores/importExportStore";
import { injectStrict, nanoid } from "@/utils";
import { activeScenarioKey, searchActionsKey } from "@/components/injects";
import { computed, ref } from "vue";
import { ImportedFileInfo } from "@/importexport/fileHandling";
import InputGroup from "@/components/InputGroup.vue";
import { stripFileExtension } from "@/utils/files";
import AlertWarning from "@/components/AlertWarning.vue";

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
