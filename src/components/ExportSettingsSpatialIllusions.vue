<script setup lang="ts">
import type { ExportFormat, UnitGeneratorSettings } from "@/types/importExport.ts";
import { ref } from "vue";
import SimpleSelect from "@/components/SimpleSelect.vue";
import type { SelectItem } from "@/components/types";
import type { EntityId } from "@/types/base";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import NumberInputGroup from "@/components/NumberInputGroup.vue";

interface Props {
  format: ExportFormat;
}

const props = defineProps<Props>();
const settings = defineModel<UnitGeneratorSettings>({ required: true });
const {
  unitActions,
  store: { state },
} = injectStrict(activeScenarioKey);

const rootUnitItems = ref<SelectItem<EntityId>[]>([]);
state.sides.forEach((sideId) => {
  unitActions.walkSide(sideId, (unit, level, parent, sideGroup, side) => {
    if (unit.subUnits.length === 0) return;
    //html space

    const indent = "..".repeat(level);
    rootUnitItems.value.push({
      label: side.name + " " + indent + " " + unit.name,
      value: unit.id,
    });
  });
});

if (!settings.value.rootUnit) {
  settings.value.rootUnit = rootUnitItems.value[0].value;
}
</script>

<template>
  <section class="prose prose-sm dark:prose-invert">
    <p>
      Export a unit hierarchy for use with the
      <a href="https://spatialillusions.com/unitgenerator/" target="_blank"
        >Spatial Illusions Orbat builder</a
      >
    </p>
  </section>
  <fieldset class="space-y-4">
    <SimpleSelect :items="rootUnitItems" v-model="settings.rootUnit" label="Root unit" />

    <NumberInputGroup
      v-model="settings.maxLevels"
      label="Max levels/depth"
      :min="1"
      :max="10"
    />
  </fieldset>
</template>
