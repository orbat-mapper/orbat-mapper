<script setup lang="ts">
import { TriangleAlertIcon } from "lucide-vue-next";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const props = defineProps({
  title: { type: String, default: "Attention needed" },
});
</script>

<template>
  <Alert>
    <TriangleAlertIcon />
    <AlertTitle>{{ title }}</AlertTitle>
    <AlertDescription>
      <slot />
    </AlertDescription>
  </Alert>
</template>
