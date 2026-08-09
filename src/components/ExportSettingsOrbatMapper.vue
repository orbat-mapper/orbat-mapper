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
// Existing persisted export settings predate layer selection. Start those users with
// every layer selected, preserving the export behavior they had before this option.
if (form.value.layerIds === undefined) form.value.layerIds = [...state.layerStack];

const sides = computed(() => {
  return state.sides.map((id) => state.sideMap[id]);
});

const layers = computed(() => {
  return state.layerStack.map((id) => state.layerStackMap[id]).filter(Boolean);
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
  <section class="prose prose-sm dark:prose-invert">
    <p>Export partial scenario</p>
  </section>
  <fieldset class="flex flex-col gap-4">
    <InputGroupTemplate label="Select which side groups you want to export">
      <div class="divide-y">
        <div v-for="v in sides" :key="v.id" class="grid grid-cols-4 gap-4 py-3">
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
    <InputGroupTemplate label="Select which layers you want to export">
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <InputCheckbox
          v-for="layer in layers"
          :key="layer.id"
          :label="layer.name"
          :description="
            layer.kind === 'overlay' && layer.specialization === 'controlMeasure'
              ? 'Control measures'
              : undefined
          "
          :value="layer.id"
          v-model="form.layerIds"
        />
      </div>
      <p v-if="!layers.length" class="text-muted-foreground text-sm">
        This scenario has no layers.
      </p>
    </InputGroupTemplate>
    <InputGroup label="Scenario name" v-model="form.scenarioName" />
    <InputGroup label="Name of downloaded file" v-model="form.fileName" />
  </fieldset>
</template>
