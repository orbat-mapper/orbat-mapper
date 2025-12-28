<script setup lang="ts">
import { computed, useId } from "vue";
import { Field, FieldContent, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import { type AcceptableValue, CheckboxGroupRoot } from "reka-ui";

interface Props {
  id?: string;
  label?: string;
  description?: string;
}
const props = withDefaults(defineProps<Props>(), {});
const localValue = defineModel<boolean | unknown[]>({
  required: false,
});

const isArrayValue = computed(() => Array.isArray(localValue.value));

const _id = props.id || useId();
</script>
<template>
  <Field class="relative" orientation="horizontal">
    <CheckboxGroupRoot v-if="isArrayValue" v-model="localValue as any">
      <Checkbox :id="_id" v-bind="$attrs"
    /></CheckboxGroupRoot>
    <Checkbox v-else v-model="localValue as any" :id="_id" v-bind="$attrs" />
    <FieldContent>
      <FieldLabel :for="_id">
        <slot name="label">{{ label }}</slot>
      </FieldLabel>

      <FieldDescription v-if="description || $slots.description">
        <slot name="description">{{ description }}</slot>
      </FieldDescription>
    </FieldContent>
  </Field>
</template>

<script lang="ts">
export default {
  inheritAttrs: false,
};
</script>
