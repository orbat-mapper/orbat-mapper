<script setup lang="ts">
import { XMarkIcon } from "@heroicons/vue/24/outline";

const props = defineProps<{ title?: string }>();
const emit = defineEmits(["close"]);
</script>

<template>
  <div class="overflow-hidden shadow-sm">
    <div class="relative px-4 py-5 sm:p-6">
      <p v-if="title" class="text-muted-foreground -mt-2 mb-4 text-sm">{{ title }}</p>
      <div class="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
        <button
          type="button"
          class="text-muted-foreground hover:text-foreground focus:ring-ring bg-background rounded-md focus:ring-2 focus:ring-offset-2 focus:outline-hidden"
          @click="$emit('close')"
        >
          <span class="sr-only">Close</span>
          <XMarkIcon class="h-6 w-6" aria-hidden="true" />
        </button>
      </div>
      <slot></slot>
    </div>
  </div>
</template>
