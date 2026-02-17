<script setup lang="ts">
defineProps<{ label: string; description?: string }>();
</script>

<template>
  <div class="bg-card text-card-foreground rounded-lg border p-6 shadow-sm">
    <div class="md:grid md:grid-cols-3 md:gap-6">
      <div class="md:col-span-1">
        <h3 class="text-lg leading-6 font-semibold">{{ label }}</h3>
        <div class="text-muted-foreground mt-1 text-sm">
          <slot name="description">
            <p v-if="description">{{ description }}</p>
          </slot>
        </div>
      </div>
      <div class="mt-5 md:col-span-2 md:mt-0">
        <div class="space-y-6">
          <slot></slot>
        </div>
      </div>
    </div>
  </div>
</template>
