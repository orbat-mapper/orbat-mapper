<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { MinusIcon, PlusIcon } from "@lucide/vue";
import type { LineString, Position } from "geojson";
import { storeToRefs } from "pinia";

import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { parseMGRS } from "@/geo/utils";
import { formatMGRS } from "@/utils/geoConvert";
import { useRecordingStore } from "@/stores/recordingStore";
import { updateScenarioFeatureGeometry } from "@/modules/scenarioeditor/scenarioDrawHelpers";
import type { NGeometryLayerItem } from "@/types/internalModels";
import PanelSubHeading from "@/components/PanelSubHeading.vue";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const props = defineProps<{ feature: NGeometryLayerItem }>();

const scenario = injectStrict(activeScenarioKey);
const { isRecordingGeometry } = storeToRefs(useRecordingStore());

const mgrsRows = ref<string[]>([]);
const rowErrors = ref<(string | null)[]>([]);
const applyError = ref<string | null>(null);

/** Skip re-syncing local inputs right after we wrote geometry ourselves. */
let lastAppliedCoordsKey: string | null = null;

function resolvedLine(): LineString | null {
  const geometry = props.feature._state?.geometry ?? props.feature.geometry;
  return geometry.type === "LineString" ? geometry : null;
}

function coordsKey(coordinates: Position[]): string {
  return JSON.stringify(coordinates);
}

function positionToMgrsInput(position: Position): string {
  return formatMGRS(position, 4);
}

function syncFromFeature() {
  const line = resolvedLine();
  if (!line) return;
  mgrsRows.value = line.coordinates.map((coordinate) => positionToMgrsInput(coordinate));
  rowErrors.value = mgrsRows.value.map(() => null);
  applyError.value = null;
  lastAppliedCoordsKey = coordsKey(line.coordinates);
}

watch(
  () => props.feature.id,
  () => syncFromFeature(),
  { immediate: true },
);

watch(
  () => {
    const line = resolvedLine();
    return line ? coordsKey(line.coordinates) : null;
  },
  (key) => {
    if (!key || key === lastAppliedCoordsKey) return;
    syncFromFeature();
  },
);

const canRemoveRow = computed(() => mgrsRows.value.length > 2);

function validateRows(): Position[] | null {
  const positions: Position[] = [];
  const errors: (string | null)[] = [];
  let hasError = false;

  for (const value of mgrsRows.value) {
    const trimmed = value.trim();
    if (!trimmed) {
      errors.push("Enter an MGRS coordinate");
      hasError = true;
      continue;
    }
    const position = parseMGRS(trimmed);
    if (!position) {
      errors.push("Invalid MGRS coordinate");
      hasError = true;
      continue;
    }
    errors.push(null);
    positions.push(position);
  }

  rowErrors.value = errors;
  if (hasError) return null;
  if (positions.length < 2) {
    applyError.value = "A line needs at least two coordinates.";
    return null;
  }
  applyError.value = null;
  return positions;
}

function addRow() {
  mgrsRows.value.push("");
  rowErrors.value.push(null);
}

function removeRow(index: number) {
  if (!canRemoveRow.value) return;
  mgrsRows.value.splice(index, 1);
  rowErrors.value.splice(index, 1);
}

function applyCoordinates() {
  const coordinates = validateRows();
  if (!coordinates) return;

  const geometry: LineString = {
    type: "LineString",
    coordinates,
  };

  lastAppliedCoordsKey = coordsKey(coordinates);
  updateScenarioFeatureGeometry(
    scenario,
    props.feature.id,
    geometry,
    { geometryKind: "LineString" },
    {},
    isRecordingGeometry.value,
    { noEmit: false },
  );
}
</script>

<template>
  <section class="border-border space-y-3 border-t pt-4">
    <PanelSubHeading>MGRS coordinates</PanelSubHeading>
    <p class="text-muted-foreground text-sm">
      Enter MGRS grid references for each vertex. The line updates when you click Apply.
    </p>

    <div class="space-y-2">
      <div
        v-for="(_, index) in mgrsRows"
        :key="index"
        class="flex items-start gap-2"
      >
        <div class="flex-auto space-y-1">
          <Input
            v-model="mgrsRows[index]"
            :aria-label="`MGRS coordinate ${index + 1}`"
            placeholder="e.g. 33U PU 1234 5678"
            class="font-mono text-sm"
          />
          <p v-if="rowErrors[index]" class="text-destructive text-xs">
            {{ rowErrors[index] }}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          :disabled="!canRemoveRow"
          :title="canRemoveRow ? 'Remove coordinate' : 'A line needs at least two coordinates'"
          @click="removeRow(index)"
        >
          <MinusIcon class="size-4" />
        </Button>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <Button type="button" variant="outline" size="sm" @click="addRow()">
        <PlusIcon class="size-4" />
        Add coordinate
      </Button>
      <Button type="button" size="sm" @click="applyCoordinates()">Apply</Button>
    </div>

    <p v-if="applyError" class="text-destructive text-sm">{{ applyError }}</p>
  </section>
</template>
