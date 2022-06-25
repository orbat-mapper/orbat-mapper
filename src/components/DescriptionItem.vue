<template>
  <div class="">
    <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">
      <slot name="label">{{ label }}</slot>
    </dt>
    <dd class="mt-1 text-sm text-gray-900 dark:text-gray-200" :class="ddClass">
      <slot />
    </dd>
  </div>
</template>

<script setup>
const props = defineProps({
  label: { type: String },
  ddClass: { type: String },
});
</script>
