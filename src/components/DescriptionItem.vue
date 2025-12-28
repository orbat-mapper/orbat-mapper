<template>
  <div class="">
    <dt class="text-muted-foreground text-sm font-medium">
      <slot name="label">{{ label }}</slot>
    </dt>
    <dd class="mt-1 text-sm" :class="ddClass">
      <slot />
    </dd>
  </div>
</template>

<script setup lang="ts">
defineProps({
  label: { type: String },
  ddClass: { type: String },
});
</script>
