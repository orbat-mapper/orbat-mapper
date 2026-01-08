<script setup lang="ts">
import { PlusIcon } from "@heroicons/vue/24/solid";
import { Button } from "@/components/ui/button";
const props = withDefaults(defineProps<{ simple?: boolean }>(), { simple: false });
const emit = defineEmits(["add"]);
</script>

<template>
  <div class="text-center">
    <template v-if="!simple">
      <svg
        class="text-muted-foreground mx-auto h-12 w-12"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          vector-effect="non-scaling-stroke"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
        />
      </svg>
      <h3 class="text-foreground mt-2 text-sm font-medium">Side</h3>
      <p class="text-muted-foreground mt-1 text-sm">
        Get started by creating a side.
      </p></template
    >
    <div class="mt-6">
      <Button @click="$emit('add')" type="button">
        <PlusIcon class="size-4" aria-hidden="true" />
        Add Side
      </Button>
    </div>
  </div>
</template>
