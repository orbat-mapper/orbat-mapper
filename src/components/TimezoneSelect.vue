<template>
  <SimpleSelect :values="timeZonesNames" v-model="tzValue" />
</template>

<script setup lang="ts">
import { timeZonesNames } from "@vvo/tzdb";
import { useVModel } from "@vueuse/core";
import SimpleSelect from "./SimpleSelect.vue";

const props = defineProps<{ modelValue: string }>();
const emit = defineEmits(["update:modelValue"]);

const tzValue = useVModel(props, "modelValue", emit);
</script>
