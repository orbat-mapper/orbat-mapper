<template>
  <div class="text-muted-foreground font-mono text-sm" title="Frames per second">
    FPS: {{ Math.round(fps) }}
  </div>
</template>

<script setup lang="ts">
import { useFps } from "@vueuse/core";
const fps = useFps();
</script>
