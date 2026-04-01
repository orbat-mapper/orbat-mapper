<script setup lang="ts">
import { IconClockEditOutline as IconClockEdit } from "@iconify-prerendered/vue-mdi";
import { MapPinned, Workflow } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { useRecordingStore } from "@/stores/recordingStore";

const recordStore = useRecordingStore();
</script>

<template>
  <footer
    class="border-border bg-muted/60 flex min-h-12 shrink-0 items-center justify-end border-t px-3 py-2"
  >
    <Button
      variant="ghost"
      size="sm"
      class="text-muted-foreground h-8 gap-1.5 px-1.5"
      :class="{
        'text-red-700 dark:text-red-300': recordStore.isRecordingHierarchy,
      }"
      @click="recordStore.isRecordingHierarchy = !recordStore.isRecordingHierarchy"
      :title="
        recordStore.isRecordingHierarchy
          ? 'Unit hierarchy recording is on.'
          : 'Unit hierarchy recording is off. Use Rec to enable it.'
      "
      :aria-label="
        recordStore.isRecordingHierarchy
          ? 'Unit hierarchy recording is on.'
          : 'Unit hierarchy recording is off. Use Rec to enable it.'
      "
    >
      <Workflow class="size-4" />
      <span
        class="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs"
        :class="
          recordStore.isRecordingHierarchy
            ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300'
            : 'border-border bg-background text-muted-foreground'
        "
      >
        <span
          class="size-1.5 rounded-full"
          :class="
            recordStore.isRecordingHierarchy ? 'bg-red-600' : 'bg-muted-foreground/50'
          "
        />
        <IconClockEdit class="size-3.5" />
      </span>
    </Button>
    <Button
      variant="ghost"
      size="sm"
      class="text-muted-foreground -ml-1 h-8 gap-1.5 px-1.5"
      :class="{
        'text-red-700 dark:text-red-300': recordStore.isRecordingLocation,
      }"
      @click="recordStore.isRecordingLocation = !recordStore.isRecordingLocation"
      :title="
        recordStore.isRecordingLocation
          ? 'Unit position recording is on.'
          : 'Unit position recording is off. Use Rec to enable it.'
      "
      :aria-label="
        recordStore.isRecordingLocation
          ? 'Unit position recording is on.'
          : 'Unit position recording is off. Use Rec to enable it.'
      "
    >
      <MapPinned class="size-4" />
      <span
        class="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs"
        :class="
          recordStore.isRecordingLocation
            ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300'
            : 'border-border bg-background text-muted-foreground'
        "
      >
        <span
          class="size-1.5 rounded-full"
          :class="
            recordStore.isRecordingLocation ? 'bg-red-600' : 'bg-muted-foreground/50'
          "
        />
        <IconClockEdit class="size-3.5" />
      </span>
    </Button>
  </footer>
</template>
