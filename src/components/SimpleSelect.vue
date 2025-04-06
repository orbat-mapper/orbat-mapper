<template>
  <InputGroupTemplate :label="label" :description="description">
    <template v-slot:default="{ id }">
      <select
        v-model="selectedValue"
        :id="id"
        class="block w-full rounded-md border-0 bg-transparent py-1.5 pr-10 pl-3 text-gray-900 ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-white/5 dark:text-gray-200"
      >
        <option v-if="addNone" :value="null">None</option>
        <option v-for="val in computedValues" :value="val.value" :key="val.value">
          {{ val.label }}
        </option>
      </select>
    </template>
    <template #hint><slot name="hint" /></template>
  </InputGroupTemplate>
</template>

<script setup lang="ts">
import InputGroupTemplate from "./InputGroupTemplate.vue";
import { useVModel } from "@vueuse/core";
import { computed } from "vue";
import { type SelectItem } from "./types";

const props = defineProps<{
  label?: string;
  description?: string;
  modelValue?: string | number | null;
  items?: SelectItem[];
  values?: (string | number)[];
  addNone?: boolean;
}>();
const emit = defineEmits(["update:modelValue"]);

const selectedValue = useVModel(props, "modelValue", emit);
const computedValues = computed(() => {
  if (props.items) return props.items;

  return (props.values || []).map((i) => ({
    label: i,
    value: i,
  }));
});
</script>
