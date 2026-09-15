<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { useCoaGenerationSession } from "@/modules/scenarioeditor/coaGenerationSession";

const {
  snapshot,
  ranking,
  entityEvidenceRows,
  playing,
  loading,
  trafficLoading,
  errorMessage,
  step,
  reset,
  togglePlay,
} = useCoaGenerationSession();

function hypothesisBarClass(hypothesis: string) {
  switch (hypothesis) {
    case "SPOIL":
      return "bg-blue-500";
    case "INTEG":
      return "bg-emerald-500";
    case "DISP":
      return "bg-amber-500";
    case "HOLD":
      return "bg-violet-500";
    default:
      return "bg-muted-foreground";
  }
}

function formatEvidence(value: number) {
  return Number.isFinite(value) ? value.toExponential(2) : "—";
}
</script>

<template>
  <section class="space-y-4">
    <div class="grid grid-cols-2 gap-2">
      <Button type="button" size="sm" :disabled="snapshot.done || loading" @click="step">
        Step
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        :disabled="snapshot.done || loading"
        @click="togglePlay"
      >
        {{ playing ? "Pause" : "Play" }}
      </Button>
    </div>
    <Button
      type="button"
      size="sm"
      variant="secondary"
      class="w-full"
      :disabled="loading"
      @click="reset"
    >
      Reset
    </Button>

    <p v-if="trafficLoading" class="text-muted-foreground text-xs">
      Loading remaining traffic in batches of 50…
    </p>
    <p v-if="errorMessage" class="text-destructive text-xs">{{ errorMessage }}</p>

    <div class="space-y-2 rounded-md border p-3 text-sm">
      <div>
        <span class="text-muted-foreground">Status:</span>
        <span class="ml-1 font-medium">{{ snapshot.stepLabel }}</span>
      </div>
      <div v-if="snapshot.observationCount">
        <span class="text-muted-foreground">Traffic loaded:</span>
        <span class="ml-1 font-medium">
          {{ snapshot.observationCount }} reports · {{ snapshot.stepCount }} hourly steps
        </span>
      </div>
      <div>
        <span class="text-muted-foreground">MLCOA:</span>
        <span class="ml-1 font-medium">{{ snapshot.mlcoa ?? "—" }}</span>
      </div>
      <div v-if="snapshot.entropy != null">
        <span class="text-muted-foreground">Entropy:</span>
        <span class="ml-1 font-medium">{{ snapshot.entropy.toFixed(2) }} bits</span>
      </div>
      <p v-if="snapshot.flags.length" class="text-amber-700 dark:text-amber-400">
        {{ snapshot.flags.join(", ") }}
      </p>
    </div>

    <div class="space-y-2">
      <h3 class="text-sm font-semibold">COA belief</h3>
      <div v-for="item in ranking" :key="item.name" class="space-y-1">
        <div class="flex items-center justify-between text-xs">
          <span>{{ item.name }}</span>
          <span class="text-muted-foreground font-mono"
            >{{ (item.value * 100).toFixed(0) }}%</span
          >
        </div>
        <div class="bg-muted h-2 overflow-hidden rounded-full">
          <div
            class="bg-primary h-full rounded-full transition-all"
            :style="{ width: `${item.value * 100}%` }"
          />
        </div>
      </div>
    </div>

    <div v-if="snapshot.entityEvidence" class="space-y-3 border-t pt-4">
      <div>
        <h3 class="text-sm font-semibold">Per-entity evidence</h3>
        <p class="text-muted-foreground mt-0.5 text-xs">
          Relative COA support from each entity's latest update
        </p>
      </div>

      <div class="flex flex-wrap gap-x-3 gap-y-1 text-[10px]">
        <span
          v-for="hypothesis in snapshot.entityEvidence.hypotheses"
          :key="hypothesis"
          class="flex items-center gap-1"
        >
          <span class="size-2 rounded-sm" :class="hypothesisBarClass(hypothesis)" />
          {{ hypothesis }}
        </span>
      </div>

      <div v-for="row in entityEvidenceRows" :key="row.entity" class="space-y-1">
        <div class="flex items-center justify-between gap-2 text-xs">
          <span class="truncate font-medium">{{ row.entity }}</span>
          <span class="text-muted-foreground shrink-0 font-mono">
            {{ row.topHypothesis }} {{ (row.topShare * 100).toFixed(0) }}%
          </span>
        </div>
        <div class="bg-muted flex h-2 overflow-hidden rounded-full">
          <div
            v-for="share in row.shares"
            :key="share.hypothesis"
            class="h-full transition-all"
            :class="hypothesisBarClass(share.hypothesis)"
            :style="{ width: `${share.value * 100}%` }"
            :title="`${share.hypothesis}: ${(share.value * 100).toFixed(1)}%`"
          />
        </div>
        <div class="text-muted-foreground text-right text-[10px]">
          Spread <span class="font-mono">{{ row.spread.toExponential(2) }}</span>
        </div>
      </div>

      <p class="text-muted-foreground border-t pt-2 text-[10px]">
        Step evidence
        <span class="font-mono">{{
          formatEvidence(snapshot.entityEvidence.evidence)
        }}</span>
        · from {{ snapshot.entityEvidence.stepLabel }}
      </p>
    </div>
  </section>
</template>
