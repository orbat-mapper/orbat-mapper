<script setup lang="ts">
import { type OrbatMapperExportSettings } from "@/types/importExport.ts";
import { computed } from "vue";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import InputCheckbox from "@/components/InputCheckbox.vue";
import InputGroupTemplate from "@/components/InputGroupTemplate.vue";
import InputGroup from "@/components/InputGroup.vue";

const form = defineModel<OrbatMapperExportSettings>({ required: true });

const {
  store: { state },
} = injectStrict(activeScenarioKey);

form.value.scenarioName = state.info.name;

const sides = computed(() => {
  return state.sides.map((id) => state.sideMap[id]);
});

function toggleSide(sideId: string) {
  const groups = state.sideMap[sideId].groups;
  if (form.value.sideGroups.some((g) => groups.includes(g))) {
    form.value.sideGroups = form.value.sideGroups.filter((g) => !groups.includes(g));
  } else {
    form.value.sideGroups.push(...groups);
  }
}
</script>

<template>
  <section class="prose prose-sm">
    <p>Export partial scenario</p>
  </section>
  <fieldset class="flex flex-col gap-4">
    <InputGroupTemplate label="Select which side groups you want to export">
      <div class="divide-y">
        <div v-for="v in sides" class="grid grid-cols-4 gap-4 py-3">
          <button
            type="button"
            class="flex text-sm font-medium"
            @click="toggleSide(v.id)"
          >
            {{ v.name }}
          </button>

          <InputCheckbox
            v-for="g in v.groups"
            :label="state.sideGroupMap[g].name"
            :value="g"
            :key="g"
            v-model="form.sideGroups"
          />
        </div>
      </div>
    </InputGroupTemplate>
    <InputGroup label="Scenario name" v-model="form.scenarioName" />
    <InputGroup label="Name of downloaded file" v-model="form.fileName" />
  </fieldset>
</template>
