<template>
  <SimpleSelect :values="timeZonesNamesWithUtc" v-model="tzValue" />
</template>

<script setup lang="ts">
import { timeZonesNames } from "@vvo/tzdb";
import { useVModel } from "@vueuse/core";
import SimpleSelect from "./SimpleSelect.vue";

const props = withDefaults(defineProps<{ modelValue?: string }>(), { modelValue: "UTC" });
const emit = defineEmits(["update:modelValue"]);

const timeZonesNamesWithUtc = [...timeZonesNames, "UTC"];

const tzValue = useVModel(props, "modelValue", emit);
</script>
