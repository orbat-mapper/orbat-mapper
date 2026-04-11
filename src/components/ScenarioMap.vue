<script setup lang="ts">
import { onUnmounted, ref, shallowRef } from "vue";
import MapContainer from "./MapContainer.vue";
import OLMap from "ol/Map";
import { OlMapAdapter } from "@/geo/engines/openlayers/olMapAdapter";
import { useGeoStore } from "@/stores/geoStore";
import { useMapSettingsStore } from "@/stores/mapSettingsStore";
import type Select from "ol/interaction/Select";
import type { ScenarioLayerController } from "@/geo/contracts/scenarioLayerController";
import ScenarioMapLogic from "@/components/ScenarioMapLogic.vue";
import MapContextMenu from "@/components/MapContextMenu.vue";

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

onUnmounted(() => {
  if (geoStore.mapAdapter === ownAdapter) {
    geoStore.setMapAdapter(null);
  }
  ownAdapter = null;
});
</script>
<template>
  <div class="@container h-full">
    <div class="map-wrapper bg-background relative h-full">
      <MapContextMenu :map-ref="mapRef" v-slot="{ onContextMenu }">
        <MapContainer
          @ready="onMapReady"
          @dragover.prevent
          :base-layer-name="mapSettings.baseLayerName"
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

<style>
.map-wrapper {
  --ol-toolbar-clearance-left: 3rem;
}

@container (min-width: 40rem) {
  .map-wrapper {
    --ol-toolbar-clearance-left: 0rem;
  }
}

@container (min-width: 40rem) and (max-width: 60rem) {
  .map-wrapper {
    --ol-toolbar-clearance-left: 4.5rem;
  }
}

.ol-scale-line {
  bottom: calc(2.2rem + var(--ol-toolbar-clearance-left));
}
</style>
