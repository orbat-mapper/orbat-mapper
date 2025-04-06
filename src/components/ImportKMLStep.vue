<script setup lang="ts">
import BaseButton from "@/components/BaseButton.vue";
import { injectStrict, nanoid } from "@/utils";
import { activeScenarioKey, searchActionsKey } from "@/components/injects";
import { ref } from "vue";
import type { ImportedFileInfo } from "@/importexport/fileHandling";
import InputGroup from "@/components/InputGroup.vue";
import { stripFileExtension } from "@/utils/files";
import InputCheckbox from "@/components/InputCheckbox.vue";
import AlertWarning from "@/components/AlertWarning.vue";
import { RadioGroup, RadioGroupLabel, RadioGroupOption } from "@headlessui/vue";

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
    <RadioGroup v-model="inputOption" class="mt-4 flex items-center gap-x-8">
      <RadioGroupLabel class="text-sm font-medium text-gray-700"
        >Import KML as:
      </RadioGroupLabel>
      <RadioGroupOption
        v-for="{ label, value } in [{ label: 'Vector image layer', value: 'imageLayer' }]"
        v-slot="{ checked }"
        :key="value"
        :value="value"
      >
        <span
          :class="[
            checked
              ? 'bg-indigo-100 text-indigo-700'
              : 'text-gray-500 hover:text-gray-700',
            'cursor-pointer rounded-md px-3 py-2 text-sm font-medium',
          ]"
          >{{ label }}</span
        >
      </RadioGroupOption>
    </RadioGroup>

    <form @submit.prevent="onLoad" class="flex max-h-[80vh] flex-col">
      <div v-if="inputOption === 'imageLayer'">
        <section class="my-4 space-y-4">
          <InputGroup label="Vector layer name" v-model="form.layerName" />
          <InputCheckbox label="Extract KML styles" v-model="form.extractStyles" />
        </section>

        <AlertWarning title="Warning"
          >KML layers are currently only visible while the scenario is open. They are not
          saved as part of the scenario.
        </AlertWarning>
      </div>

      <footer class="flex shrink-0 items-center justify-end space-x-2 pt-4">
        <BaseButton type="submit" primary small>Import</BaseButton>
        <BaseButton small @click="onCancel()">Cancel</BaseButton>
      </footer>
    </form>
  </div>
</template>
