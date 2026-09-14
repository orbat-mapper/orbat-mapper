<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { useCoaGenerationSession } from "@/modules/scenarioeditor/coaGenerationSession";

const { snapshot, ranking, playing, loading, trafficLoading, errorMessage, step, reset, togglePlay } =
  useCoaGenerationSession();
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
          <span class="text-muted-foreground font-mono">{{ (item.value * 100).toFixed(0) }}%</span>
        </div>
        <div class="bg-muted h-2 overflow-hidden rounded-full">
          <div
            class="bg-primary h-full rounded-full transition-all"
            :style="{ width: `${item.value * 100}%` }"
          />
        </div>
      </div>
    </div>
  </section>
</template>
