<template>
  <SimpleSelect :values="timeZonesNamesWithUtc" v-model="tzValue" />
</template>

<script setup lang="ts">
import { timeZonesNames } from "@vvo/tzdb";
import SimpleSelect from "./SimpleSelect.vue";

const tzValue = defineModel({ default: "UTC" });
const timeZonesNamesWithUtc = [...timeZonesNames, "UTC"];
</script>
