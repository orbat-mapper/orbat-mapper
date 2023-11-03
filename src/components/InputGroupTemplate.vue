<template>
  <div>
    <div class="flex justify-between">
      <label :for="id" class="block text-sm font-medium leading-6 text-gray-700">
        <slot name="label">{{ label }}</slot>
      </label>
      <div v-if="hint || $slots.hint">
        <slot name="hint">
          <span class="text-sm leading-6 text-gray-500" id="email-optional">
            {{ hint }}
          </span>
        </slot>
      </div>
    </div>
    <div class="mt-1">
      <slot :id="id"></slot>
    </div>
    <p v-if="description || $slots.description" class="mt-2 text-sm text-gray-500">
      <slot name="description">{{ description }}</slot>
    </p>
  </div>
</template>

<script setup lang="ts">
import { nanoid } from "nanoid";

const props = defineProps<{ label?: string; description?: string; hint?: string }>();

const id = nanoid();
</script>
