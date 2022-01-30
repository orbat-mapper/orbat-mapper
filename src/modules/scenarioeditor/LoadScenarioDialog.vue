<template>
  <SimpleModal v-model="open" dialog-title="Load scenario">
    <input type="file" id="file" @change="onFileLoad" />
    <label for="file">Upload</label>
  </SimpleModal>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useVModel } from "@vueuse/core";
import SimpleModal from "../../components/SimpleModal.vue";
import { Scenario } from "../../types/models";

export default defineComponent({
  name: "LoadScenarioDialog",
  components: { SimpleModal },
  props: {
    modelValue: { type: Boolean, default: false },
  },
  emits: ["update:modelValue", "loaded"],
  setup(props, { emit }) {
    const open = useVModel(props, "modelValue");
    const onFileLoad = (e: Event) => {
      const target = <HTMLInputElement>e.target;
      if (!target?.files?.length) return;
      const file = target.files[0];
      const reader = new FileReader();
      reader.onload = function (evt) {
        const content = evt?.target?.result as string;
        try {
          const scenarioData = JSON.parse(content) as Scenario;
          if (scenarioData?.type === "ORBAT-mapper") {
            emit("loaded", scenarioData);
            open.value = false;
          }
        } catch (e) {
          console.error("Failed to load", file.name);
        }
      };
      reader.readAsText(file);
    };

    return { open, onFileLoad };
  },
});
</script>
