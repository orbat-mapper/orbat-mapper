<script setup lang="ts">
import { XIcon } from "lucide-vue-next";
import { Button } from "@/components/ui/button/index";
</script>

<template>
  <Button size="icon" variant="ghost">
    <span class="sr-only">Close</span>
    <XIcon class="" aria-hidden="true" />
  </Button>
</template>
