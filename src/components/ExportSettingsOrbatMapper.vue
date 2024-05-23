<script setup lang="ts">
import { OrbatMapperExportSettings, UnitGeneratorSettings } from "@/types/convert";
import { computed, ref } from "vue";
import { SelectItem } from "@/components/types";
import { EntityId } from "@/types/base";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import InputCheckbox from "@/components/InputCheckbox.vue";
import InputGroupTemplate from "@/components/InputGroupTemplate.vue";

const settings = defineModel<OrbatMapperExportSettings>({ required: true });
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
  <fieldset class="space-y-4">
    <InputGroupTemplate label="Select the sides you want to export">
      <div class="mt-4 grid grid-cols-4 gap-4">
        <InputCheckbox
          v-for="v in sides"
          :label="v.name"
          :value="v.id"
          :key="v.id"
          v-model="settings.sides"
        />
      </div>
    </InputGroupTemplate>
  </fieldset>
</template>
