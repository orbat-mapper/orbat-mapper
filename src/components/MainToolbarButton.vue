<script setup lang="ts">
import { Button } from "@/components/ui/button";

withDefaults(defineProps<{ active?: boolean }>(), { active: false });
</script>

<template>
  <Button
    type="button"
    variant="ghost"
    size="icon"
    :class="active ? 'bg-army2 hover:bg-army2/90!' : 'hover:bg-army2/50!'"
  >
    <slot />
  </Button>
</template>
