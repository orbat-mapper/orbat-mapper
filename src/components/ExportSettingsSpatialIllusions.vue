<script setup lang="ts">
import type { SpatialIllusionsSettings } from "@/importexport/export/exporters/spatialIllusions";
import SymbolCodeSelect from "@/components/SymbolCodeSelect.vue";
import { useRootUnits } from "@/composables/scenarioUtils";
import NumberInputGroup from "@/components/NumberInputGroup.vue";

const settings = defineModel<SpatialIllusionsSettings>({ required: true });

const { rootUnitItems, groupedRootUnitItems } = useRootUnits();

if (!settings.value.rootUnit && rootUnitItems.value.length > 0) {
  settings.value.rootUnit = rootUnitItems.value[0].code;
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
    <SymbolCodeSelect
      :items="rootUnitItems"
      :groups="groupedRootUnitItems"
      v-model="settings.rootUnit"
      label="Root unit"
    />

    <NumberInputGroup
      v-model="settings.maxLevels"
      label="Max levels/depth"
      :min="1"
      :max="10"
    />
  </fieldset>
</template>
