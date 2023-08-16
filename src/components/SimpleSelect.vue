<template>
  <InputGroupTemplate :label="label" :description="description" v-slot="{ id }">
    <select
      v-model="selectedValue"
      :id="id"
      class="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
    >
      <option v-if="addNone" :value="null">None</option>
      <option v-for="val in computedValues" :value="val.value" :key="val.value">
        {{ val.label }}
      </option>
    </select>
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
