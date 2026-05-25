<script setup lang="ts">
import { computed, defineAsyncComponent, ref } from "vue";
import { Map as MlMap } from "maplibre-gl";
import { Button } from "@/components/ui/button";
import { useGeoStore } from "@/stores/geoStore";
import { useBoxDraw } from "@/composables/geoBoxDraw";

// Lazy-loaded on demand: the export form and its rendering dependencies are
// only fetched once the user opens the export tool.
const ExportImageForm = defineAsyncComponent(
  () => import("@/modules/maplibreview/ExportImageForm.vue"),
);

type Bbox = [number, number, number, number];

const geoStore = useGeoStore();

const showExport = ref(false);
const drawnExportBounds = ref<Bbox | null>(null);

// The image export is MapLibre-specific, so only expose it when the active
// map engine is a MapLibre map.
const mlMap = computed(() => {
  const native = geoStore.mapAdapter?.getNativeMap();
  return native instanceof MlMap ? native : null;
});

const exportBoxDraw = useBoxDraw(() => geoStore.mapAdapter);
exportBoxDraw.onDrawEnd((bbox) => {
  drawnExportBounds.value = bbox;
});

function onRequestDrawRect() {
  // Keep the panel mounted so the form's mode stays on "rect"; clear any prior
  // rectangle so it doesn't linger on the map while the new one is drawn.
  drawnExportBounds.value = null;
  exportBoxDraw.start();
}
</script>

<template>
  <div class="space-y-4">
    <section class="space-y-2">
      <h4 class="text-sm font-medium">Export</h4>
      <p class="text-muted-foreground text-sm">
        Save the map as a PNG, with optional print sizing and a custom area.
      </p>

      <template v-if="mlMap">
        <Button
          v-if="!showExport"
          variant="outline"
          size="sm"
          @click="showExport = true"
        >
          Export map image…
        </Button>
        <ExportImageForm
          v-else
          :map="mlMap"
          :drawn-bounds="drawnExportBounds"
          cancelable
          @request-draw-rect="onRequestDrawRect"
          @cancel="showExport = false"
        />
      </template>
      <p v-else class="text-muted-foreground text-sm">
        Image export is only available with the MapLibre map engine.
      </p>
    </section>
  </div>
</template>
