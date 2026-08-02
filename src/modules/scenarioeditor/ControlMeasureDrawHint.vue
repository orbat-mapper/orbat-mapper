<script setup lang="ts">
/**
 * The transient draw hint, shown only while a control-measure draw session is open.
 *
 * Deliberately *not* a persistent dock: it exists for the duration of one gesture and
 * takes no layout space otherwise, so the map chrome does not grow a permanent
 * control-measure region. The point counts come off the live `DrawSession`
 * (`minControlPoints` / `maxControlPoints`), never a host-side per-kind table.
 */
import { computed } from "vue";
import { Button } from "@/components/ui/button";
import { getControlMeasureKindOption } from "@/modules/scenarioeditor/controlMeasurePicker";
import { scenarioDrawKey } from "@/components/injects";
import { injectStrict } from "@/utils";
import type { ControlMeasureId } from "@orbat-mapper/control-measures";

const { controlMeasureDrawProgress, commitControlMeasureDraw, cancel } =
  injectStrict(scenarioDrawKey);

const kindName = computed(() => {
  const graphicKind = controlMeasureDrawProgress.value?.graphicKind;
  if (!graphicKind) return "";
  return (
    getControlMeasureKindOption(graphicKind as ControlMeasureId)?.name ??
    String(graphicKind)
  );
});

const pointCount = computed(() => {
  const progress = controlMeasureDrawProgress.value;
  if (!progress) return "";
  const { pointCount: count, minControlPoints, maxControlPoints } = progress;
  // "2 of 3" while a fixed-length kind is still being placed, "4 points" once a
  // variable-length kind is past its minimum and the ceiling is open.
  const target = maxControlPoints ?? minControlPoints;
  if (count < target) return `${count} of ${target} points`;
  return `${count} ${count === 1 ? "point" : "points"}`;
});
</script>

<template>
  <div
    v-if="controlMeasureDrawProgress"
    class="bg-background/85 pointer-events-auto flex items-center gap-2 rounded-md px-2 py-1 text-sm shadow-sm backdrop-blur-sm"
  >
    <span class="font-medium">{{ kindName }}</span>
    <span class="text-muted-foreground tabular-nums">{{ pointCount }}</span>
    <span class="text-muted-foreground hidden sm:inline">
      <kbd>Enter</kbd> to finish, <kbd>Esc</kbd> to cancel
    </span>
    <Button
      type="button"
      variant="outline"
      size="sm"
      :disabled="!controlMeasureDrawProgress.canCommit"
      @click="commitControlMeasureDraw()"
    >
      Done
    </Button>
    <Button type="button" variant="ghost" size="sm" @click="cancel()"> Cancel </Button>
  </div>
</template>
