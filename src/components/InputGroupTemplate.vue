<script setup lang="ts">
import { useId } from "vue";
import { Label } from "@/components/ui/label";

const props = defineProps<{ label?: string; description?: string; hint?: string }>();

const id = useId();
</script>
<template>
  <div>
    <div class="flex justify-between">
      <Label :for="id">
        <slot name="label">{{ label }}</slot>
      </Label>
      <div v-if="hint || $slots.hint">
        <slot name="hint">
          <span class="text-muted-foreground text-sm leading-6">
            {{ hint }}
          </span>
        </slot>
      </div>
    </div>
    <div class="mt-1">
      <slot :id="id"></slot>
    </div>
    <p
      v-if="description || $slots.description"
      class="text-muted-foreground mt-2 text-sm"
    >
      <slot name="description">{{ description }}</slot>
    </p>
  </div>
</template>
