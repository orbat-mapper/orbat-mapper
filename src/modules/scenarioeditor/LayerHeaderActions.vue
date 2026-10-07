<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

/**
 * The actions on the right side of a Layers panel section header.
 *
 * They sit over the end of the header and show only on hover or focus, so while hidden
 * they take no width from the name. `class`
 * goes on the actions, e.g. to match a highlighted header's background.
 */
defineOptions({ inheritAttrs: false });
const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
  <div
    :class="
      cn(
        'bg-sidebar pointer-events-none absolute top-1/2 -right-2 flex -translate-y-1/2 items-center pl-2 opacity-0 group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100',
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
