<template>
  <div :class="props.class">
    <label
      v-if="label || $slots.label"
      :for="inputId"
      class="block text-sm font-medium text-slate-800 dark:text-slate-200"
    >
      <slot name="label">{{ label }}</slot>
    </label>
    <div class="mt-1">
      <input
        type="text"
        v-model="inputValue"
        :id="inputId"
        class="block w-full rounded-md border-0 bg-transparent py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 invalid:border-pink-500 invalid:text-pink-600 focus:ring-2 focus:ring-inset focus:ring-indigo-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500 disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-500 disabled:shadow-none dark:bg-white/5 dark:text-gray-200 sm:text-sm sm:leading-6"
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
