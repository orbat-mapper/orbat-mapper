<script setup lang="ts">
import { IconClockEditOutline as IconClockEdit } from "@iconify-prerendered/vue-mdi";
import { Switch } from "@/components/ui/switch";
import { timeRecordStore } from "@/stores/recordStore";

const recordStore = timeRecordStore();
</script>

<template>
  <footer
    class="border-border bg-muted/60 flex h-12 shrink-0 items-center justify-end gap-2 border-t px-3"
  >
    <label
      class="flex items-center gap-2 text-sm"
      title="Toggle hierarchy change recording during drag and drop"
    >
      <Switch v-model="recordStore.recordHierarchyChanges" />
      <span class="flex items-center gap-1">
        <IconClockEdit class="text-muted-foreground size-4" />
        <span>Track hierarchy changes</span>
      </span>
    </label>
  </footer>
</template>
