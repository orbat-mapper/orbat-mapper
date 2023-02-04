<script setup lang="ts">
import {
  CursorDefaultOutline,
  MapMarker,
  SquareEditOutline,
  TrashCanOutline,
  VectorCircleVariant,
  VectorLine,
  VectorTriangle,
  LockOutline,
  LockOpenVariantOutline,
} from "mdue";
import ToolbarButton from "./ToolbarButton.vue";
import OLMap from "ol/Map";
import { toRef, watch } from "vue";
import VerticalToolbar from "./VerticalToolbar.vue";
import VectorLayer from "ol/layer/Vector";
import { useEditingInteraction } from "@/composables/geoEditing";
import { onKeyStroke, useToggle } from "@vueuse/core";
import Select from "ol/interaction/Select";
import { useUiStore } from "@/stores/uiStore";

const props = defineProps<{
  olMap: OLMap;
  layer: VectorLayer<any>;
  select?: Select;
}>();
const emit = defineEmits(["add", "modify"]);

const [addMultiple, toggleAddMultiple] = useToggle(false);

const { startDrawing, currentDrawType, startModify, isModifying, cancel, isDrawing } =
  useEditingInteraction(props.olMap, toRef(props, "layer"), {
    emit,
    addMultiple: addMultiple,
    select: props.select,
  });

const uiStore = useUiStore();

watch(
  [isDrawing, isModifying],
  ([drawing, modifying]) => {
    uiStore.editToolbarActive = drawing || modifying;
  },
  { immediate: true }
);

onKeyStroke("Escape", (event) => {
  cancel();
});
</script>

<template>
  <div class="flex flex-col">
    <VerticalToolbar class="shadow">
      <ToolbarButton
        top
        @click="toggleAddMultiple()"
        title="Keep selected tool active after drawing "
      >
        <LockOutline v-if="addMultiple" class="h-5 w-5" />
        <LockOpenVariantOutline v-else class="h-5 w-5" />
      </ToolbarButton>
      <ToolbarButton title="Select features" @click="cancel()" :active="!currentDrawType">
        <CursorDefaultOutline class="h-5 w-5" />
      </ToolbarButton>
      <ToolbarButton
        title="Draw point feature"
        @click="startDrawing('Point')"
        :active="currentDrawType === 'Point'"
      >
        <MapMarker class="h-5 w-5" />
      </ToolbarButton>
      <ToolbarButton
        title="Draw polyline"
        @click="startDrawing('LineString')"
        :active="currentDrawType === 'LineString'"
      >
        <VectorLine class="h-5 w-5" />
      </ToolbarButton>
      <ToolbarButton
        title="Draw polygon"
        @click="startDrawing('Polygon')"
        :active="currentDrawType === 'Polygon'"
      >
        <VectorTriangle class="h-5 w-5" />
      </ToolbarButton>
      <ToolbarButton
        bottom
        title="Draw circle"
        @click="startDrawing('Circle')"
        :active="currentDrawType === 'Circle'"
      >
        <VectorCircleVariant class="h-5 w-5" />
      </ToolbarButton>
    </VerticalToolbar>

    <VerticalToolbar class="mt-2 shadow">
      <ToolbarButton
        top
        title="Modify feature"
        @click="startModify()"
        :active="isModifying"
      >
        <SquareEditOutline class="h-5 w-5" />
      </ToolbarButton>
      <ToolbarButton bottom title="Delete feature" disabled>
        <TrashCanOutline class="h-5 w-5" />
      </ToolbarButton>
    </VerticalToolbar>
  </div>
</template>
