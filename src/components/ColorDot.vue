<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps<{
  /** CSS colour; when unset the dot is drawn as an empty dashed outline. */
  color?: string;
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <span
    aria-hidden="true"
    :class="
      cn(
        'size-3 flex-none rounded-full border',
        props.color ? 'border-foreground/15' : 'border-muted-foreground border-dashed',
        props.class,
      )
    "
    :style="{ backgroundColor: props.color }"
  />
</template>
