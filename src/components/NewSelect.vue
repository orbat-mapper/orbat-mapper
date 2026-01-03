<script setup lang="ts">
import InputGroupTemplate from "./InputGroupTemplate.vue";
import { computed } from "vue";
import { type NewSelectItem } from "./types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const props = withDefaults(
  defineProps<{
    label?: string;
    description?: string;
    items?: NewSelectItem[];
    values?: (string | number)[];
    addNone?: boolean;
    size?: "sm" | "lg" | "default";
    placeholder?: string;
  }>(),
  { size: "default" },
);

const selectedValue = defineModel<string | number | null>({ required: false });
const computedValues = computed(() => {
  if (props.items) return props.items;

  return (props.values || []).map((i) => ({
    label: i,
    value: i,
    disabled: undefined,
  }));
});
</script>

<template>
  <InputGroupTemplate :label="label" :description="description">
    <template v-slot:default="{ id }">
      <Select v-model="selectedValue" :size :id="id">
        <SelectTrigger class="w-full"><SelectValue :placeholder /></SelectTrigger>
        <SelectContent class="border-border">
          <SelectItem v-if="addNone" :value="null">None</SelectItem>
          <SelectItem
            v-for="{ value, label, disabled } in computedValues"
            :value="value"
            :key="value"
            :disabled
          >
            {{ label }}</SelectItem
          >
        </SelectContent>
      </Select>
    </template>
    <template #hint><slot name="hint" /></template>
  </InputGroupTemplate>
</template>
