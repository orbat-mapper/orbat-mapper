<script setup lang="ts">
import { useId } from "vue";
import { Label } from "@/components/ui/label";
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
} from "@/components/ui/number-field";

type NumberInputGroupProps = {
  label?: string;
  value?: number;
  description?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
};

const props = defineProps<NumberInputGroupProps>();
const value = defineModel<number>();

const inputId = useId();
</script>

<template>
  <NumberField :id="inputId" v-model="value" :min :max :step :disabled>
    <Label :for="inputId">{{ label }}</Label>
    <NumberFieldContent>
      <NumberFieldDecrement />
      <NumberFieldInput />
      <NumberFieldIncrement />
    </NumberFieldContent>
  </NumberField>
</template>
