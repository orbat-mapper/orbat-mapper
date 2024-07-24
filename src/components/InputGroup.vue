<template>
  <div :class="props.class">
    <label
      v-if="label || $slots.label"
      :for="inputId"
      class="block text-sm font-medium text-gray-700"
    >
      <slot name="label">{{ label }}</slot>
    </label>
    <div class="mt-1">
      <input
        type="text"
        v-model="inputValue"
        :id="inputId"
        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        v-bind="$attrs"
      />
    </div>
    <p v-if="description || $slots.description" class="mt-2 text-sm text-gray-500">
      <slot name="description">{{ description }}</slot>
    </p>
  </div>
</template>

<script setup lang="ts">
import { HTMLAttributes, onMounted } from "vue";
import { nanoid } from "nanoid";

const props = defineProps<{
  id?: string;
  label?: string;
  description?: string;
  autofocus?: boolean;
  class?: HTMLAttributes["class"];
}>();

const inputValue = defineModel();

defineOptions({
  inheritAttrs: false,
});

const inputId = props.id ?? nanoid(6);

onMounted(() => {
  if (props.autofocus) {
    document.getElementById(inputId)?.focus();
  }
});
</script>
