<script setup lang="ts">
import DocLink from "@/components/DocLink.vue";

interface Props {
  title: string;
  subtitle?: string;
  helpUrl?: string;
  hasSidebar?: boolean;
  sidebarWidth?: string;
}

withDefaults(defineProps<Props>(), {
  hasSidebar: false,
  sidebarWidth: "lg:w-[28rem]",
});
</script>

<template>
  <div class="flex h-full min-h-0 flex-col overflow-y-auto lg:overflow-hidden">
    <!-- Header -->
    <header
      class="flex shrink-0 flex-col gap-3 border-b px-6 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-2"
    >
      <div class="flex min-w-0 items-center justify-between gap-4 sm:justify-start">
        <div class="min-w-0">
          <h3 class="text-base leading-tight font-semibold sm:text-lg">
            {{ title }}
          </h3>
          <p v-if="subtitle" class="text-muted-foreground truncate text-xs leading-none">
            {{ subtitle }}
          </p>
        </div>
        <DocLink v-if="helpUrl" :href="helpUrl" class="shrink-0" />
      </div>
      <div class="flex items-center gap-2">
        <slot name="actions" />
      </div>
    </header>

    <!-- Content with optional sidebar -->
    <div
      v-if="hasSidebar"
      class="flex flex-col lg:min-h-0 lg:flex-1 lg:flex-row lg:overflow-hidden"
    >
      <!-- Left Sidebar -->
      <aside
        class="bg-background flex w-full flex-col border-b lg:flex-none lg:flex-col lg:overflow-hidden lg:border-r lg:border-b-0"
        :class="sidebarWidth"
      >
        <div class="flex-1 overflow-y-auto">
          <div class="space-y-6 p-6">
            <slot name="sidebar" />
          </div>
        </div>
      </aside>

      <!-- Right Content -->
      <main
        class="bg-muted/10 flex h-[32rem] min-w-0 flex-col lg:h-auto lg:min-h-0 lg:flex-1"
      >
        <slot />
      </main>
    </div>

    <!-- Content without sidebar -->
    <div v-else class="flex-1 overflow-y-auto p-6">
      <slot />
    </div>
  </div>
</template>
