<script setup lang="ts">
import {
  IconCursorDefaultOutline as SelectIcon,
  IconLockOpenVariantOutline,
  IconLockOutline,
  IconMagnet as SnapIcon,
  IconClockEditOutline as IconClockEdit,
  IconGesture as FreehandIcon,
} from "@iconify-prerendered/vue-mdi";

import { computed, ref } from "vue";

import MainToolbarButton from "@/components/MainToolbarButton.vue";
import ToolbarGroup from "@/components/ToolbarGroup.vue";
import DrawToolSplitButton from "@/modules/scenarioeditor/DrawToolSplitButton.vue";
import ControlMeasureQuickTools from "@/modules/scenarioeditor/ControlMeasureQuickTools.vue";
import MapEditorSubToolbar from "@/modules/scenarioeditor/MapEditorSubToolbar.vue";
import ControlMeasurePickerDialog from "@/modules/scenarioeditor/ControlMeasurePickerDialog.vue";
import ControlMeasureDefaultsPopover from "@/modules/scenarioeditor/ControlMeasureDefaultsPopover.vue";
import DrawSelectionTools from "@/modules/scenarioeditor/DrawSelectionTools.vue";
import { useControlMeasureToolStore } from "@/stores/controlMeasureToolStore";
import type { ControlMeasureId } from "@orbat-mapper/control-measures";
import type { DrawType } from "@/geo/drawTypes";
import { useToggle } from "@vueuse/core";
import { useRecordingStore } from "@/stores/recordingStore";
import { storeToRefs } from "pinia";
import { useSelectedItems } from "@/stores/selectedStore";
import { scenarioDrawKey } from "@/components/injects";
import { injectStrict } from "@/utils";
import { useMainToolbarStore } from "@/stores/mainToolbarStore";

const { addMultiple, lastDrawType } = storeToRefs(useMainToolbarStore());
const toggleAddMultiple = useToggle(addMultiple);

const recordStore = useRecordingStore();
const { isRecordingGeometry } = storeToRefs(recordStore);
const { toggleRecordingGeometry } = recordStore;

// Provided by the map view rather than created here: this toolbar is `v-if`'d, and an
// instance that dies with it would take the armed tool and the snap/translate/freehand
// toggles down with it.
const {
  startDrawing,
  currentDrawType,
  cancel,
  snap,
  freehand,
  isModifying,
  translate,
  armed,
  arm,
  controlMeasureArmed,
  canControlMeasures,
} = injectStrict(scenarioDrawKey);

const controlMeasureStore = useControlMeasureToolStore();
const { lastKind } = storeToRefs(controlMeasureStore);
const pickerOpen = ref(false);

const armedGraphicKind = computed(() =>
  armed.value.kind === "cmDraw" ? armed.value.graphicKind : null,
);

// While a control-measure session runs, the plain-draw toggles do not all mean
// something: `freehand` has no counterpart in the library at all. `snap` does — it fans
// out to the engine's own snapping options in `useScenarioDraw`.

// The shape split button and the control-measure tools only emit; arming — and
// remembering what was armed (the split button re-arms the last shape; the last kind
// sizes the defaults popover) — belongs to the toolbar, which is also where the picker
// dialog lands.
function drawShape(drawType: DrawType) {
  lastDrawType.value = drawType;
  startDrawing(drawType);
}

function drawControlMeasure(kind: ControlMeasureId) {
  lastKind.value = kind;
  arm({ kind: "cmDraw", graphicKind: kind });
}

// The selection actions join the row while there is a selection, or while Edit or Move
// (modes that outlive one) is on.
const { selectedFeatureIds } = useSelectedItems();
const selectionToolsShown = computed(
  () => selectedFeatureIds.value.size > 0 || isModifying.value || translate.value,
);

const toggleSnap = useToggle(snap);
const toggleFreehand = useToggle(freehand);
</script>

<template>
  <!-- Control measures lead and every group is captioned: behind a split button that
       looked like the shape tool, users drew plain lines instead of phase lines. The
       actions on a selection join the row only while they apply. -->
  <MapEditorSubToolbar label="Draw" captioned>
    <MainToolbarButton title="Select" :active="!currentDrawType" @click="cancel()">
      <SelectIcon class="size-5" />
    </MainToolbarButton>
    <div class="border-border mx-1 h-5 border-l" />
    <ToolbarGroup label="Control measures">
      <ControlMeasureQuickTools
        :armed-kind="armedGraphicKind"
        :disabled="!canControlMeasures"
        :crowded="selectionToolsShown"
        @select="drawControlMeasure"
        @more="pickerOpen = true"
      />
      <ControlMeasureDefaultsPopover :disabled="!canControlMeasures" />
    </ToolbarGroup>
    <div class="border-border mx-1 h-5 border-l" />
    <ToolbarGroup label="Shapes">
      <DrawToolSplitButton :current-draw-type="currentDrawType" @select="drawShape" />
      <MainToolbarButton
        v-if="!controlMeasureArmed"
        title="Freehand"
        @click="toggleFreehand()"
        :active="freehand"
      >
        <FreehandIcon class="size-5" />
      </MainToolbarButton>
    </ToolbarGroup>
    <div class="border-border mx-1 h-5 border-l" />
    <ToolbarGroup label="Options">
      <MainToolbarButton
        title="Keep tool active to add multiple"
        @click="toggleAddMultiple()"
        :active="addMultiple"
      >
        <IconLockOutline v-if="addMultiple" class="size-5" />
        <IconLockOpenVariantOutline v-else class="size-5" />
      </MainToolbarButton>
      <MainToolbarButton title="Snap to grid" @click="toggleSnap()" :active="snap">
        <SnapIcon class="size-5" />
      </MainToolbarButton>
      <MainToolbarButton
        title="Record feature geometry"
        @click="toggleRecordingGeometry()"
        :active="isRecordingGeometry"
      >
        <IconClockEdit class="size-5" />
      </MainToolbarButton>
    </ToolbarGroup>
    <DrawSelectionTools v-if="selectionToolsShown" />
    <ControlMeasurePickerDialog v-model="pickerOpen" @select="drawControlMeasure" />
  </MapEditorSubToolbar>
</template>
