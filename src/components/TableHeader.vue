<script setup lang="ts">
defineProps<{
  title?: string;
  description?: string;
}>();
</script>

<template>
  <div class="flex items-center">
    <div class="flex-auto">
      <h4 v-if="title" class="text-base font-semibold leading-6 text-gray-900">
        {{ title }}
      </h4>
      <p class="mt-2 text-sm text-gray-700">
        {{ description }}
      </p>
    </div>
    <div class="ml-16 mt-4 flex-none">
      <slot />
    </div>
  </div>
</template>
