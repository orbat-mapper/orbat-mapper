<script setup lang="ts">
import { computed, ref } from "vue";
import type { MapAdapter } from "@orbat-mapper/tactical-draw";
import {
  listControlMeasureMetadata,
  type ControlMeasureKind,
} from "@orbat-mapper/control-measures";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { groupByGetter } from "@/utils";
import { useTacticalDraw } from "@/modules/tacticaldraw/useTacticalDraw";

// Engine-agnostic: the host (MapLibre or OpenLayers editor) passes the
// matching adapter. The palette and draw logic are identical across engines.
const { adapter } = defineProps<{ adapter: MapAdapter }>();

const {
  isDrawing,
  drawCanCommit,
  drawPointCount,
  editingId,
  startDraw,
  finishDraw,
  cancelDraw,
  stopEdit,
} = useTacticalDraw(adapter);

const filter = ref("");

// Scaffold UI: every registered control measure, filtered by name and grouped
// by geometry. Swap this for orbat-mapper's real palette / categorisation once
// the integration lands.
const visibleGroups = computed(() => {
  const q = filter.value.trim().toLowerCase();
  const matches = listControlMeasureMetadata().filter(
    (meta) => !q || meta.name.toLowerCase().includes(q),
  );
  return groupByGetter(matches, (meta) => meta.geometry);
});
</script>

<template>
  <div
    class="border-border bg-background/90 pointer-events-auto absolute top-16 left-2 z-10 flex max-h-[70vh] w-64 flex-col gap-2 rounded-md border p-2 shadow-md backdrop-blur-sm"
  >
    <div class="flex items-center justify-between">
      <span class="text-sm font-medium">Tactical graphics</span>
      <span class="text-muted-foreground text-xs">scaffold</span>
    </div>

    <!-- Active-draw controls for variable-length kinds -->
    <div
      v-if="isDrawing"
      class="border-border flex items-center gap-2 rounded-md border border-dashed p-2"
    >
      <span class="text-muted-foreground flex-auto text-xs">
        Drawing — {{ drawPointCount }} point(s)
      </span>
      <Button size="sm" :disabled="!drawCanCommit" @click="finishDraw">Done</Button>
      <Button size="sm" variant="ghost" @click="cancelDraw">Cancel</Button>
    </div>

    <div
      v-else-if="editingId"
      class="border-border flex items-center gap-2 rounded-md border border-dashed p-2"
    >
      <span class="text-muted-foreground flex-auto text-xs">Editing</span>
      <Button size="sm" variant="ghost" @click="stopEdit">Done</Button>
    </div>

    <Input v-model="filter" type="search" placeholder="Filter…" class="h-8" />

    <div class="flex flex-col gap-3 overflow-y-auto">
      <div v-for="[geometry, items] in visibleGroups" :key="geometry">
        <div class="text-muted-foreground mb-1 text-xs font-medium uppercase">
          {{ geometry }}
        </div>
        <div class="flex flex-col gap-1">
          <Button
            v-for="item in items"
            :key="item.id"
            variant="outline"
            size="sm"
            class="justify-start"
            :disabled="isDrawing"
            @click="startDraw(item.id as ControlMeasureKind)"
          >
            {{ item.name }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
