<script setup lang="ts">
import AppNotifications from "@/components/AppNotifications.vue";
import { TooltipProvider } from "@/components/ui/tooltip";
</script>

<template>
  <!-- One provider so moving between tooltips skips the open delay -->
  <TooltipProvider>
    <router-view></router-view>
  </TooltipProvider>
  <AppNotifications />
</template>
