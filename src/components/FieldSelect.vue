<script setup lang="ts">
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import type { SelectItem as SelectItemType } from "@/components/types.ts";
import { useId } from "vue";
const props = withDefaults(
  defineProps<{
    label?: string;
    description?: string;
    items?: SelectItemType[];
    values?: (string | number)[];
    addNone?: boolean;
    size?: "sm" | "lg" | "default";
  }>(),
  { size: "default" },
);

const selectedValue = defineModel<string | number | null>({ required: false });
const id = useId();
</script>

<template>
  <Field>
    <FieldLabel :for="id">{{ label }}</FieldLabel>
    <Select v-model="selectedValue" :id>
      <SelectTrigger><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem v-if="addNone" :value="null">None</SelectItem>
        <SelectItem
          v-for="sideGroup in items"
          :key="sideGroup.value"
          :value="sideGroup.value"
          >{{ sideGroup.label }}</SelectItem
        >
      </SelectContent>
    </Select>
    <FieldDescription v-if="description || $slots.description"
      ><slot name="description">{{ description }}</slot></FieldDescription
    >
  </Field>
</template>
