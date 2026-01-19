<script setup lang="ts">
import { timeZonesNames } from "@vvo/tzdb";
import SimpleSelect from "./SimpleSelect.vue";
import { MILITARY_TIME_ZONE_NAMES } from "@/utils/militaryTimeZones";

const tzValue = defineModel({ default: "UTC" });
const timeZonesNamesWithUtc = [...timeZonesNames, "UTC", ...MILITARY_TIME_ZONE_NAMES];
</script>

<template>
  <SimpleSelect :values="timeZonesNamesWithUtc" v-model="tzValue" />
</template>
