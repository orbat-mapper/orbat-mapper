<script setup lang="ts">
import type { Map as MlMap } from "maplibre-gl";
import NewSimpleModal from "@/components/NewSimpleModal.vue";
import ExportImageForm from "@/modules/maplibreview/ExportImageForm.vue";

type Bbox = [number, number, number, number];

const open = defineModel<boolean>({ default: false });

defineProps<{
  map: MlMap;
  drawnBounds?: Bbox | null;
}>();

const emit = defineEmits<{
  (e: "request-draw-rect"): void;
  (e: "exported"): void;
}>();

function onExported() {
  emit("exported");
  open.value = false;
}
</script>

<template>
  <NewSimpleModal
    v-model="open"
    dialog-title="Export map image"
    description="Save the map as a PNG, with optional print sizing and a custom area."
    class="sm:max-w-2xl"
  >
    <ExportImageForm
      class="mt-2"
      :map="map"
      :drawn-bounds="drawnBounds"
      cancelable
      @request-draw-rect="emit('request-draw-rect')"
      @exported="onExported"
      @cancel="open = false"
    />
  </NewSimpleModal>
</template>
