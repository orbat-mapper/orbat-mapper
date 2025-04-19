<template>
  <div class="relative flex items-start">
    <div class="flex h-5 items-center">
      <Checkbox v-model="localValue" :id="_id" v-bind="$attrs" />
    </div>
    <div class="ml-3 text-sm">
      <label :for="_id" class="font-medium">
        <slot name="label">{{ label }}</slot>
      </label>
      <p v-if="description || $slots.description" class="text-muted-foreground">
        <slot name="description">{{ description }}</slot>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useId } from "vue";
import { Checkbox } from "@/components/ui/checkbox";

interface Props {
  id?: string;
  label?: string;
  description?: string;
  modelValue?: boolean;
}
const props = withDefaults(defineProps<Props>(), {});
const localValue = defineModel<boolean>();
const emit = defineEmits(["update:modelValue"]);

const _id = props.id ?? useId();
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
};
</script>
