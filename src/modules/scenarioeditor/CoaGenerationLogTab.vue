<script setup lang="ts">
import { computed } from "vue";
import {
  useCoaGenerationSession,
  type CoaLogKind,
} from "@/modules/scenarioeditor/coaGenerationSession";

const { sortedLogEntries } = useCoaGenerationSession();

const kindClass: Record<CoaLogKind, string> = {
  REPORT: "text-sky-700 dark:text-sky-400",
  MLCOA: "text-emerald-700 dark:text-emerald-400",
  DISPOSITION: "text-violet-700 dark:text-violet-400",
  FLAG: "text-amber-700 dark:text-amber-400",
  LATENCY: "text-muted-foreground",
  INFO: "text-muted-foreground",
};

const hasEntries = computed(() => sortedLogEntries.value.length > 0);
</script>

<template>
  <section class="space-y-3">
    <p class="text-muted-foreground text-xs">
      Operation log — newest first. Reports, MLCOA updates, dispositions, and flags stay off
      the map.
    </p>

    <p v-if="!hasEntries" class="text-muted-foreground text-sm">No log entries yet. Step or Play from the Run tab.</p>

    <ul v-else class="max-h-[min(50vh,28rem)] space-y-3 overflow-y-auto pr-1">
      <li
        v-for="entry in sortedLogEntries"
        :key="entry.id"
        class="border-border border-b pb-3 text-sm last:border-0"
      >
        <div class="mb-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span class="text-muted-foreground font-mono text-xs">[{{ entry.t }}]</span>
          <span class="font-semibold" :class="kindClass[entry.kind]">{{ entry.kind }}</span>
        </div>
        <p class="leading-snug">{{ entry.message }}</p>
      </li>
    </ul>
  </section>
</template>
