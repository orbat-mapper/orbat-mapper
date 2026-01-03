<script setup lang="ts">
import { Button } from "@/components/ui/button/index.js";
const props = withDefaults(
  defineProps<{
    primary?: boolean;
    secondary?: boolean;
    small?: boolean;
    large?: boolean;
    huge?: boolean;
  }>(),
  {
    primary: false,
    secondary: false,
    small: false,
    large: false,
    huge: false,
  },
);
</script>

<template>
  <Button
    :variant="primary ? 'default' : secondary ? 'secondary' : 'outline'"
    :size="small ? 'sm' : large ? 'lg' : huge ? 'lg' : undefined"
  >
    <slot />
  </Button>
</template>
