<script setup lang="ts">
import InputCheckbox from "@/components/InputCheckbox.vue";
import type { MilxSettings } from "@/importexport/export/exporters/milx";

const settings = defineModel<MilxSettings>({ required: true });
</script>

<template>
  <fieldset class="space-y-4">
    <InputCheckbox
      label="Include units"
      description="Units with a location at current scenario time"
      v-model="settings.includeUnits"
    />
    <InputCheckbox label="Use one layer per side" v-model="settings.oneFolderPerSide" />
  </fieldset>
</template>
