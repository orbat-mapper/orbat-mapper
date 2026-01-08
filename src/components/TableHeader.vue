<script setup lang="ts">
defineProps<{
  title?: string;
  description?: string;
}>();
</script>

<template>
  <div class="flex items-center">
    <div class="flex-auto">
      <h4 v-if="title" class="text-foreground text-base leading-6 font-semibold">
        {{ title }}
      </h4>
      <p class="text-muted-foreground mt-2 text-sm">
        {{ description }}
      </p>
    </div>
    <div class="mt-4 ml-16 flex-none">
      <slot />
    </div>
  </div>
</template>
