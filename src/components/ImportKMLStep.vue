<template>
  <div class="">
    <p>Import KML file as vector layer.</p>
    <form @submit.prevent="onLoad" class="flex max-h-[80vh] flex-col">
      <section class="my-4 space-y-4">
        <InputGroup label="Vector layer name" v-model="form.layerName" />
        <InputCheckbox label="Extract KML styles" v-model="form.extractStyles" />
      </section>
      <div class="prose prose-sm overflow-auto">
        <a :href="objectUrl">{{ fileInfo.objectUrl }}</a>
      </div>

      <footer class="flex flex-shrink-0 items-center justify-end space-x-2 pt-4">
        <BaseButton type="submit" primary small>Import</BaseButton>
        <BaseButton small @click="onCancel()">Cancel</BaseButton>
      </footer>
    </form>
  </div>
</template>

<script setup lang="ts">
import BaseButton from "@/components/BaseButton.vue";
import { useNotifications } from "@/composables/notifications";
import { useImportStore } from "@/stores/importExportStore";
import { injectStrict, nanoid } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { ref } from "vue";
import { ImportedFileInfo } from "@/importexport/fileHandling";
import InputGroup from "@/components/InputGroup.vue";
import { stripFileExtension } from "@/utils/files";
import InputCheckbox from "@/components/InputCheckbox.vue";

interface Props {
  objectUrl: string;
  fileInfo: ImportedFileInfo;
}

const props = defineProps<Props>();
const emit = defineEmits(["cancel", "loaded"]);
const { geo } = injectStrict(activeScenarioKey);
const store = useImportStore();

const form = ref({
  layerName: stripFileExtension(props.fileInfo.fileName),
  extractStyles: true,
});

const { send } = useNotifications();

async function onLoad(e: Event) {
  geo.addMapLayer({
    url: props.objectUrl,
    name: form.value.layerName,
    extractStyles: form.value.extractStyles,
    id: nanoid(),
    type: "KMLLayer",
  });
  emit("loaded");
}

function onCancel() {
  emit("cancel");
}
</script>
