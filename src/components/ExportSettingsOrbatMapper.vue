<script setup lang="ts">
import { OrbatMapperExportSettings } from "@/types/convert";
import { computed } from "vue";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import InputCheckbox from "@/components/InputCheckbox.vue";
import InputGroupTemplate from "@/components/InputGroupTemplate.vue";
import InputGroup from "@/components/InputGroup.vue";

const form = defineModel<OrbatMapperExportSettings>({ required: true });
const {
  unitActions,
  store: { state },
} = injectStrict(activeScenarioKey);

const sides = computed(() => {
  return state.sides.map((id) => state.sideMap[id]);
});
</script>

<template>
  <section class="prose prose-sm">
    <p>Export partial scenario</p>
  </section>
  <fieldset class="flex flex-col gap-4">
    <InputGroupTemplate label="Select the sides you want to export">
      <div class="mt-2 grid grid-cols-4 gap-4">
        <InputCheckbox
          v-for="v in sides"
          :label="v.name"
          :value="v.id"
          :key="v.id"
          v-model="form.sides"
        />
      </div>
    </InputGroupTemplate>
    <InputGroup label="Name of downloaded file" v-model="form.fileName" />
  </fieldset>
</template>
