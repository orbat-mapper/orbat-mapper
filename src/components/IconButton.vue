<script setup lang="ts">
import { Button } from "@/components/ui/button";
</script>

<template>
  <Button variant="ghost" size="icon" class="text-muted-foreground">
    <slot />
  </Button>
</template>
