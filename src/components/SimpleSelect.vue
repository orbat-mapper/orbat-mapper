<template>
  <InputGroupTemplate :label="label" :description="description">
    <template v-slot:default="{ id }">
      <select
        v-model="selectedValue"
        :id="id"
        class="block w-full rounded-md border-0 bg-transparent py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 dark:bg-white/5 sm:text-sm sm:leading-6"
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
import { computed, defineComponent, PropType } from "vue";
import { SelectItem } from "./types";

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
