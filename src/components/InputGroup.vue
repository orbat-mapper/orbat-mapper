<script setup lang="ts">
import { type HTMLAttributes, onMounted, useId } from "vue";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils.ts";

const props = defineProps<{
  id?: string;
  label?: string;
  description?: string;
  autofocus?: boolean;
  disabled?: boolean;
  class?: HTMLAttributes["class"];
}>();

const inputValue = defineModel<string | number>();

defineOptions({
  inheritAttrs: false,
});

const inputId = props.id ?? useId();

onMounted(() => {
  if (props.autofocus) {
    document.getElementById(inputId)?.focus();
  }
});
</script>
<template>
  <Field :class="cn('group', props.class)" :data-disabled="disabled">
    <FieldLabel v-if="label || $slots.label" :for="inputId">
      <slot name="label">{{ label }}</slot>
    </FieldLabel>
    <Input
      type="text"
      v-model="inputValue"
      :id="inputId"
      v-bind="$attrs"
      :disabled="disabled"
    />
    <FieldDescription v-if="description || $slots.description">
      <slot name="description">{{ description }}</slot>
    </FieldDescription>
  </Field>
</template>
