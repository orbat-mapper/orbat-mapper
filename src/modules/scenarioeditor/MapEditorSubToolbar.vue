<script setup lang="ts">
import { IconClose as CloseIcon } from "@iconify-prerendered/vue-mdi";
import FloatingPanel from "@/components/FloatingPanel.vue";
import MainToolbarButton from "@/components/MainToolbarButton.vue";
import { useMainToolbarStore } from "@/stores/mainToolbarStore";

defineProps<{ label: string }>();

const store = useMainToolbarStore();
</script>

<template>
  <FloatingPanel
    class="no-scrollbar pointer-events-auto flex max-w-full items-center gap-0.5 overflow-x-auto rounded-md p-1"
  >
    <p class="text-muted-foreground hidden px-2 text-sm font-medium sm:block">
      {{ label }}
    </p>
    <div class="border-border mx-1 hidden h-5 border-l sm:block" />
    <slot />
    <div class="border-border mx-1 h-5 border-l" />
    <MainToolbarButton title="Close toolbar" @click="store.clearToolbar()">
      <CloseIcon class="size-5" />
    </MainToolbarButton>
  </FloatingPanel>
</template>
