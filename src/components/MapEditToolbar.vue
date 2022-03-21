<script setup lang="ts">
import { MapMarker, VectorLine, VectorTriangle } from "mdue";
import ToolbarButton from "./ToolbarButton.vue";
import OLMap from "ol/Map";
import { toRef } from "vue";
import VerticalToolbar from "./VerticalToolbar.vue";
import VectorLayer from "ol/layer/Vector";
import { useEditingInteraction } from "../composables/geoEditing";

const props = defineProps<{ olMap: OLMap; layer: VectorLayer<any> }>();

const { startDrawing, currentDrawType } = useEditingInteraction(
  props.olMap,
  toRef(props, "layer")
);
</script>

<template>
  <div>
    <VerticalToolbar>
      <ToolbarButton
        top
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
        bottom
        title="Draw polygon"
        @click="startDrawing('Polygon')"
        :active="currentDrawType === 'Polygon'"
      >
        <VectorTriangle class="h-5 w-5" />
      </ToolbarButton>
    </VerticalToolbar>
  </div>
</template>
