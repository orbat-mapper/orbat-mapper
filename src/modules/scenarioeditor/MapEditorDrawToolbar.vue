<script setup lang="ts">
import {
  IconCursorDefaultOutline as SelectIcon,
  IconCursorMove as MoveIcon,
  IconLockOpenVariantOutline,
  IconLockOutline,
  IconMagnet as SnapIcon,
  IconMapMarker as PointIcon,
  IconSquareEditOutline as EditIcon,
  IconTrashCanOutline as DeleteIcon,
  IconVectorCircleVariant as CircleIcon,
  IconVectorLine as LineStringIcon,
  IconVectorPolygon as PolygonIcon,
  IconVectorRectangle as RectangleIcon,
  IconClockEditOutline as IconClockEdit,
  IconGesture as FreehandIcon,
} from "@iconify-prerendered/vue-mdi";

import { IconShapePolygonPlus as MoreGraphicsIcon } from "@iconify-prerendered/vue-mdi";
import { computed, ref } from "vue";

import MainToolbarButton from "@/components/MainToolbarButton.vue";
import MapEditorSubToolbar from "@/modules/scenarioeditor/MapEditorSubToolbar.vue";
import ControlMeasurePreview from "@/modules/scenarioeditor/ControlMeasurePreview.vue";
import ControlMeasurePickerDialog from "@/modules/scenarioeditor/ControlMeasurePickerDialog.vue";
import ControlMeasureDefaultsPopover from "@/modules/scenarioeditor/ControlMeasureDefaultsPopover.vue";
import { getControlMeasureKindOption } from "@/modules/scenarioeditor/controlMeasurePicker";
import { useControlMeasureToolStore } from "@/stores/controlMeasureToolStore";
import type { ControlMeasureId } from "@orbat-mapper/control-measures";
import { useToggle } from "@vueuse/core";
import { useRecordingStore } from "@/stores/recordingStore";
import { storeToRefs } from "pinia";
import { useSelectedItems } from "@/stores/selectedStore";
import { scenarioDrawKey } from "@/components/injects";
import { injectStrict } from "@/utils";
import { useMainToolbarStore } from "@/stores/mainToolbarStore";

const { selectedFeatureIds } = useSelectedItems();

const { addMultiple } = storeToRefs(useMainToolbarStore());
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
  startModify,
  isModifying,
  cancel,
  deleteSelected,
  snap,
  translate,
  freehand,
  armed,
  arm,
  canControlMeasures,
} = injectStrict(scenarioDrawKey);

const controlMeasureStore = useControlMeasureToolStore();
const { pinnedKinds } = storeToRefs(controlMeasureStore);
const pickerOpen = ref(false);

const armedGraphicKind = computed(() =>
  armed.value.kind === "cmDraw" ? armed.value.graphicKind : null,
);

/**
 * A control-measure session is running. The three plain-draw toggles do not all mean
 * something for one: `freehand` has no counterpart in the library at all, and
 * `translate` is stage-two work (`syncTransformGraphics`). `snap` does — it fans out to
 * the engine's own snapping options in `useScenarioDraw`.
 */
const controlMeasureArmed = computed(
  () => armed.value.kind === "cmDraw" || armed.value.kind === "cmEdit",
);

const NO_ENGINE_SUPPORT = "Control measures are not supported by this map engine";

function controlMeasureTitle(kind: ControlMeasureId) {
  if (!canControlMeasures.value) return NO_ENGINE_SUPPORT;
  return getControlMeasureKindOption(kind)?.name ?? kind;
}

function drawControlMeasure(kind: ControlMeasureId) {
  arm({ kind: "cmDraw", graphicKind: kind });
}

const toggleSnap = useToggle(snap);
const toggleTranslate = useToggle(translate);
const toggleFreehand = useToggle(freehand);
</script>

<template>
  <MapEditorSubToolbar label="Draw">
    <MainToolbarButton title="Select" :active="!currentDrawType" @click="cancel()">
      <SelectIcon class="size-5" />
    </MainToolbarButton>
    <MainToolbarButton
      title="Point"
      @click="startDrawing('Point')"
      :active="currentDrawType === 'Point'"
    >
      <PointIcon class="size-5" />
    </MainToolbarButton>
    <MainToolbarButton
      title="Line"
      @click="startDrawing('LineString')"
      :active="currentDrawType === 'LineString'"
    >
      <LineStringIcon class="size-5" />
    </MainToolbarButton>
    <MainToolbarButton
      title="Polygon"
      @click="startDrawing('Polygon')"
      :active="currentDrawType === 'Polygon'"
    >
      <PolygonIcon class="size-5" />
    </MainToolbarButton>

    <MainToolbarButton
      title="Rectangle"
      @click="startDrawing('Rectangle')"
      :active="currentDrawType === 'Rectangle'"
    >
      <RectangleIcon class="size-5" />
    </MainToolbarButton>
    <MainToolbarButton
      title="Circle"
      @click="startDrawing('Circle')"
      :active="currentDrawType === 'Circle'"
    >
      <CircleIcon class="size-5" />
    </MainToolbarButton>
    <div class="border-border mx-1 h-5 border-l" />
    <MainToolbarButton
      v-for="kind in pinnedKinds"
      :key="kind"
      :title="controlMeasureTitle(kind)"
      :active="armedGraphicKind === kind"
      :disabled="!canControlMeasures"
      @click="drawControlMeasure(kind)"
    >
      <ControlMeasurePreview :kind="kind" class="size-5" />
    </MainToolbarButton>
    <MainToolbarButton
      :title="canControlMeasures ? 'More control measures' : NO_ENGINE_SUPPORT"
      :disabled="!canControlMeasures"
      @click="pickerOpen = true"
    >
      <MoreGraphicsIcon class="size-5" />
    </MainToolbarButton>
    <ControlMeasureDefaultsPopover :disabled="!canControlMeasures" />
    <div class="border-border mx-1 h-5 border-l" />
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
      v-if="!controlMeasureArmed"
      title="Freehand"
      @click="toggleFreehand()"
      :active="freehand"
    >
      <FreehandIcon class="size-5" />
    </MainToolbarButton>
    <MainToolbarButton title="Edit" @click="startModify()" :active="isModifying">
      <EditIcon class="size-5" />
    </MainToolbarButton>
    <MainToolbarButton
      title="Record feature geometry"
      @click="toggleRecordingGeometry()"
      :active="isRecordingGeometry"
    >
      <IconClockEdit class="size-5" />
    </MainToolbarButton>
    <MainToolbarButton
      :title="
        controlMeasureArmed
          ? 'Translate is not available for control measures yet'
          : 'Translate'
      "
      :disabled="controlMeasureArmed"
      @click="toggleTranslate()"
      :active="translate"
    >
      <MoveIcon class="size-5" />
    </MainToolbarButton>
    <MainToolbarButton
      title="Delete"
      :disabled="selectedFeatureIds.size === 0"
      @click="deleteSelected()"
    >
      <DeleteIcon class="size-5" />
    </MainToolbarButton>
    <ControlMeasurePickerDialog v-model="pickerOpen" @select="drawControlMeasure" />
  </MapEditorSubToolbar>
</template>
