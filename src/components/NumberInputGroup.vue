<script setup lang="ts">
import { useId } from "vue";
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
} from "@/components/ui/number-field";
import { Field, FieldLabel } from "@/components/ui/field";

type NumberInputGroupProps = {
  label?: string;
  description?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
};

defineProps<NumberInputGroupProps>();
const value = defineModel<number>();

const inputId = useId();
</script>

<template>
  <Field>
    <FieldLabel :for="inputId">{{ label }}</FieldLabel>
    <NumberField :id="inputId" v-model="value" :min :max :step :disabled>
      <NumberFieldContent>
        <NumberFieldDecrement />
        <NumberFieldInput :id="inputId" />
        <NumberFieldIncrement />
      </NumberFieldContent>
    </NumberField>
  </Field>
</template>
