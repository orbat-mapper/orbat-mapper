<script setup lang="ts">
import {
  IconClose as CloseIcon,
  IconCursorDefaultOutline as SelectIcon,
  IconCursorMove as MoveIcon,
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
import FloatingPanel from "@/components/FloatingPanel.vue";

import { useMainToolbarStore } from "@/stores/mainToolbarStore";
import MainToolbarButton from "@/components/MainToolbarButton.vue";
import { onKeyStroke, useToggle } from "@vueuse/core";
import { useRecordingStore } from "@/stores/recordingStore";
import { storeToRefs } from "pinia";
import { useSelectedItems } from "@/stores/selectedStore";
import { useScenarioDraw } from "@/modules/scenarioeditor/useScenarioDraw";

const { selectedFeatureIds } = useSelectedItems();

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

const store = useMainToolbarStore();
const toggleSnap = useToggle(snap);
const toggleTranslate = useToggle(translate);
const toggleFreehand = useToggle(freehand);

onKeyStroke("Escape", (event) => {
  cancel();
});
</script>

<template>
  <FloatingPanel
    class="no-scrollbar pointer-events-auto max-w-[calc(100vw-0.5rem)] overflow-x-auto rounded-md p-1 sm:max-w-none sm:overflow-visible"
  >
    <div class="flex min-w-max items-center space-x-0">
      <p class="text-muted-foreground hidden px-2 text-sm font-medium sm:block">Draw</p>
      <div class="border-border mr-2 h-5 border-l" />
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
      <div class="mx-2 h-5 border-l border-gray-300" />
      <div class="flex items-center">
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
        <MainToolbarButton
          title="translate"
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
      </div>
      <MainToolbarButton title="Toggle toolbar" @click="store.clearToolbar()">
        <CloseIcon class="size-5" />
      </MainToolbarButton>
    </div>
  </FloatingPanel>
</template>
