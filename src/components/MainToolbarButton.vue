<template>
  <Button
    type="button"
    variant="ghost"
    size="icon"
    class="hover:bg-army2/50"
    :class="active ? 'bg-army2' : ''"
  >
    <slot />
  </Button>
</template>
<script setup lang="ts">
import { Button } from "@/components/ui/button";

const props = withDefaults(defineProps<{ active?: boolean }>(), { active: false });
</script>
