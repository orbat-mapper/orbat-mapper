<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <section :class="cn('grid w-full grid-cols-[8ch_1fr] gap-3 pb-1 text-sm', props.class)">
    <slot />
  </section>
</template>
