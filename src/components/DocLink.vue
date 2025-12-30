<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { ExternalLinkIcon } from "lucide-vue-next";
</script>

<template>
  <Button as-child variant="link"
    ><a target="_blank">
      <slot>Help</slot><ExternalLinkIcon class="text-muted-foreground -ml-1" /></a
  ></Button>
</template>
