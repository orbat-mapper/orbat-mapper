<script setup lang="ts">
import { type HTMLAttributes, onMounted, useId } from "vue";
import { Label } from "@/components/ui/label";
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
  <div :class="cn('group', props.class)" :data-disabled="disabled">
    <Label v-if="label || $slots.label" :for="inputId" class="text-sm">
      <slot name="label">{{ label }}</slot>
    </Label>
    <div class="mt-1">
      <Input
        type="text"
        v-model="inputValue"
        :id="inputId"
        class="block"
        v-bind="$attrs"
        :disabled
      />
    </div>
    <p
      v-if="description || $slots.description"
      class="text-muted-foreground mt-2 text-sm"
    >
      <slot name="description">{{ description }}</slot>
    </p>
  </div>
</template>
