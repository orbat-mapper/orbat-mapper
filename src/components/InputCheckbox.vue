<script setup lang="ts">
import { computed, useId } from "vue";
import { nanoid } from "nanoid";

interface Props {
  id?: string;
  label?: string;
  description?: string;
}
const props = withDefaults(defineProps<Props>(), {});
const localValue = defineModel<boolean | any[]>({
  required: false,
});

const _id = props.id || useId();
</script>
<template>
  <div class="relative flex items-start">
    <div class="flex h-5 items-center">
      <input
        type="checkbox"
        v-model="localValue"
        :id="_id"
        class="border-border focus-visible:outline-ring dark:bg-input appearance-none rounded border bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
        v-bind="$attrs"
      />
    </div>
    <div class="ml-3 text-sm">
      <label :for="_id" class="font-medium text-slate-700 dark:text-slate-300">
        <slot name="label">{{ label }}</slot>
      </label>
      <p v-if="description || $slots.description" class="text-gray-500">
        <slot name="description">{{ description }}</slot>
      </p>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  inheritAttrs: false,
};
</script>
