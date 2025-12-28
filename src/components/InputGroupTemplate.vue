<script setup lang="ts">
import { type HTMLAttributes, useId } from "vue";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";

const props = defineProps<{
  label?: string;
  description?: string;
  hint?: string;
  class?: HTMLAttributes["class"];
}>();

const id = useId();
</script>
<template>
  <Field :class="cn(props.class)">
    <div class="flex justify-between">
      <FieldLabel :for="id">
        <slot name="label">{{ label }}</slot>
      </FieldLabel>
      <div v-if="hint || $slots.hint">
        <slot name="hint">
          <span class="text-muted-foreground text-sm leading-6">
            {{ hint }}
          </span>
        </slot>
      </div>
    </div>
    <slot :id="id"></slot>
    <FieldDescription v-if="description || $slots.description">
      <slot name="description">{{ description }}</slot>
    </FieldDescription>
  </Field>
</template>
