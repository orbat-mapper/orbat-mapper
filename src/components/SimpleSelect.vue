<template>
  <Field>
    <FieldLabel
      ><slot name="label">{{ label }}</slot></FieldLabel
    >
    <NativeSelect v-model="selectedValue">
      <NativeSelectOption v-if="addNone" :value="null">None</NativeSelectOption>
      <NativeSelectOption
        v-for="val in computedValues"
        :value="val.value"
        :key="val.value"
      >
        {{ val.label }}
      </NativeSelectOption>
    </NativeSelect>

    <FieldDescription v-if="description || $slots.description">
      <slot name="description">{{ description }}</slot>
    </FieldDescription>
  </Field>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { type SelectItem } from "./types";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

const props = withDefaults(
  defineProps<{
    label?: string;
    description?: string;
    items?: SelectItem[];
    values?: (string | number)[];
    addNone?: boolean;
  }>(),
  {},
);

const selectedValue = defineModel<string | number | null>({ required: false });
const computedValues = computed(() => {
  if (props.items) return props.items;

  return (props.values || []).map((i) => ({
    label: i,
    value: i,
  }));
});
</script>
