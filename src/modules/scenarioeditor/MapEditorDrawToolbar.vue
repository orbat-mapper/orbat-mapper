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
  IconVectorSquare as PolygonIcon,
  IconClockEditOutline as IconClockEdit,
  IconGesture as FreehandIcon,
} from "@iconify-prerendered/vue-mdi";

import MainToolbarButton from "@/components/MainToolbarButton.vue";
import MapEditorSubToolbar from "@/modules/scenarioeditor/MapEditorSubToolbar.vue";
import { onKeyStroke, useToggle } from "@vueuse/core";
import { useRecordingStore } from "@/stores/recordingStore";
import { storeToRefs } from "pinia";
import { useSelectedItems } from "@/stores/selectedStore";
import { useScenarioDraw } from "@/modules/scenarioeditor/useScenarioDraw";
import { useMainToolbarStore } from "@/stores/mainToolbarStore";

const { selectedFeatureIds } = useSelectedItems();

const { addMultiple } = storeToRefs(useMainToolbarStore());
const toggleAddMultiple = useToggle(addMultiple);

const recordStore = useRecordingStore();
const { isRecordingGeometry } = storeToRefs(recordStore);
const { toggleRecordingGeometry } = recordStore;

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
} = useScenarioDraw();

const toggleSnap = useToggle(snap);
const toggleTranslate = useToggle(translate);
const toggleFreehand = useToggle(freehand);

onKeyStroke("Escape", (event) => {
  cancel();
});
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
      title="Circle"
      @click="startDrawing('Circle')"
      :active="currentDrawType === 'Circle'"
    >
      <CircleIcon class="size-5" />
    </MainToolbarButton>
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
    <MainToolbarButton title="Freehand" @click="toggleFreehand()" :active="freehand">
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
    <MainToolbarButton title="translate" @click="toggleTranslate()" :active="translate">
      <MoveIcon class="size-5" />
    </MainToolbarButton>
    <MainToolbarButton
      title="Delete"
      :disabled="selectedFeatureIds.size === 0"
      @click="deleteSelected()"
    >
      <DeleteIcon class="size-5" />
    </MainToolbarButton>
  </MapEditorSubToolbar>
</template>
