<script setup lang="ts">
import { computed } from "vue";
import {
  IconCheck as DoneIcon,
  IconClose as CancelIcon,
  IconMagnet as SnapIcon,
} from "@iconify-prerendered/vue-mdi";
import { useToggle } from "@vueuse/core";

import FloatingPanel from "@/components/FloatingPanel.vue";
import MainToolbarButton from "@/components/MainToolbarButton.vue";
import { scenarioDrawKey } from "@/components/injects";
import { injectStrict } from "@/utils";
import { getControlMeasureKindOption } from "@/modules/scenarioeditor/controlMeasurePicker";
import type { ControlMeasureId } from "@orbat-mapper/control-measures";

const { drawSessionProgress, finishDrawSession, cancel, snap } =
  injectStrict(scenarioDrawKey);
const toggleSnap = useToggle(snap);

const plainNames = {
  Point: "Point",
  LineString: "Line",
  Polygon: "Polygon",
  Circle: "Circle",
  Rectangle: "Rectangle",
} as const;

const drawingName = computed(() => {
  const progress = drawSessionProgress.value;
  if (!progress) return "Drawing";
  if (progress.family === "plain") return plainNames[progress.drawType];
  return (
    getControlMeasureKindOption(progress.graphicKind as ControlMeasureId)?.name ??
    String(progress.graphicKind)
  );
});

const progressText = computed(() => {
  const progress = drawSessionProgress.value;
  if (!progress || progress.pointCount === 0) return "Tap to start";

  const { pointCount, minPoints, maxPoints } = progress;
  if (progress.family === "controlMeasure" && pointCount < (maxPoints ?? minPoints)) {
    return `${pointCount} of ${maxPoints ?? minPoints} points`;
  }
  if (pointCount < minPoints) {
    const remaining = minPoints - pointCount;
    return `${pointCount} ${pointCount === 1 ? "point" : "points"} — add ${
      remaining === 1 ? "another" : `${remaining} more`
    }`;
  }
  return `${pointCount} ${pointCount === 1 ? "point" : "points"}`;
});

const doneDisabled = computed(() => {
  const progress = drawSessionProgress.value;
  return Boolean(progress && progress.pointCount > 0 && !progress.canCommit);
});
</script>

<template>
  <FloatingPanel
    role="navigation"
    aria-label="Drawing actions"
    class="pointer-events-auto flex min-w-0 items-center gap-1 rounded-md p-0"
  >
    <p class="min-w-0 flex-1 truncate px-2 text-sm" aria-live="polite" aria-atomic="true">
      <span class="font-medium">{{ drawingName }}</span>
      <span class="text-muted-foreground"> · {{ progressText }}</span>
    </p>
    <MainToolbarButton
      title="Snap to grid"
      aria-label="Snap to grid"
      class="size-11"
      :active="snap"
      @click="toggleSnap()"
    >
      <SnapIcon class="size-5" />
    </MainToolbarButton>
    <MainToolbarButton
      title="Cancel drawing"
      aria-label="Cancel drawing"
      class="size-11"
      @click="cancel()"
    >
      <CancelIcon class="size-5" />
    </MainToolbarButton>
    <MainToolbarButton
      title="Done drawing"
      aria-label="Done drawing"
      class="size-11"
      :active="!doneDisabled"
      :disabled="doneDisabled"
      @click="finishDrawSession()"
    >
      <DoneIcon class="size-5" />
    </MainToolbarButton>
  </FloatingPanel>
</template>
