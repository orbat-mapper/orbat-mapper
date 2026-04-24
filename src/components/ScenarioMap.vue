<script setup lang="ts">
import { onUnmounted, ref, shallowRef } from "vue";
import MapContainer from "./MapContainer.vue";
import OLMap from "ol/Map";
import { OlMapAdapter } from "@/geo/engines/openlayers/olMapAdapter";
import { useGeoStore } from "@/stores/geoStore";
import { useMapSettingsStore } from "@/stores/mapSettingsStore";
import { toLonLat } from "ol/proj";
import type Select from "ol/interaction/Select";
import type View from "ol/View";
import type { ScenarioLayerController } from "@/geo/contracts/scenarioLayerController";
import ScenarioMapLogic from "@/components/ScenarioMapLogic.vue";
import MapContextMenu from "@/components/MapContextMenu.vue";
import type { Position } from "geojson";
import type { ScenarioMapViewSnapshot } from "@/modules/scenarioeditor/scenarioMapViewSnapshot";

const props = defineProps<{
  initialView?: ScenarioMapViewSnapshot;
}>();
const emit = defineEmits<{
  (
    e: "map-ready",
    value: {
      olMap: OLMap;
      featureSelectInteraction: Select;
      unitSelectInteraction: Select;
      scenarioLayerController: ScenarioLayerController;
    },
  ): void;
  (e: "map-view-change", value: ScenarioMapViewSnapshot): void;
}>();

const mapLogicComponent = ref<InstanceType<typeof ScenarioMapLogic> | null>(null);
const mapSettings = useMapSettingsStore();
const mapRef = shallowRef<OLMap>();
const geoStore = useGeoStore();

let ownAdapter: OlMapAdapter | null = null;

const onMapReady = (olMap: OLMap) => {
  mapRef.value = olMap;
  ownAdapter = new OlMapAdapter(olMap);
  geoStore.setMapAdapter(ownAdapter);
};

function onMapMoveEnd({ view }: { view: View }) {
  const center = view.getCenter();
  const zoom = view.getZoom();

  if (!center || zoom === undefined) {
    return;
  }

  emit("map-view-change", {
    center: toLonLat(center, view.getProjection()) as Position,
    zoom,
    rotation: view.getRotation(),
  });
}

onUnmounted(() => {
  if (geoStore.mapAdapter === ownAdapter) {
    geoStore.setMapAdapter(null);
  }
  ownAdapter = null;
});
</script>
<template>
  <div class="@container h-full">
    <div class="map-ui-root bg-background relative h-full">
      <MapContextMenu :map-ref="mapRef" v-slot="{ onContextMenu }">
        <MapContainer
          @ready="onMapReady"
          @moveend="onMapMoveEnd"
          @dragover.prevent
          :base-layer-name="mapSettings.baseLayerName"
          :initial-view="props.initialView"
          @contextmenu="onContextMenu"
        />
      </MapContextMenu>

      <ScenarioMapLogic
        ref="mapLogicComponent"
        v-if="mapRef"
        :ol-map="mapRef"
        @map-ready="emit('map-ready', $event)"
      />
      <slot />
    </div>
  </div>
</template>
