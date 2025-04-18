<script setup lang="ts">
import { Button } from "@/components/ui/button";
</script>

<template>
  <Button variant="ghost" size="icon" class="text-foreground/80">
    <slot />
  </Button>
</template>
