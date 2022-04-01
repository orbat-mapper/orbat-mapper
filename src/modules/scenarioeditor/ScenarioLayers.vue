<script setup lang="ts">
import { computed, onActivated, onDeactivated, ref } from "vue";
import BaseButton from "../../components/BaseButton.vue";
import { useScenarioStore } from "../../stores/scenarioStore";
import { ScenarioLayer } from "../../types/scenarioGeoModels";
import OLMap from "ol/Map";
import { useGeoStore } from "../../stores/geoStore";
import MapEditToolbar from "../../components/MapEditToolbar.vue";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";

const isActive = ref(true);
const scenarioStore = useScenarioStore();
const mapRef = useGeoStore().olMap! as OLMap;

const layers = computed(() => scenarioStore.scenario.layers);
const activeLayer = ref<ScenarioLayer | null>(null);

const vectorLayer = new VectorLayer({
  source: new VectorSource(),
});

mapRef.addLayer(vectorLayer);

function addLayer() {}

onActivated(() => (isActive.value = true));
onDeactivated(() => (isActive.value = false));
</script>

<template>
  <div class="px-6">
    <h2 class="text-lg font-medium text-gray-900">Layers</h2>
    <p class="mt-1 text-sm text-gray-500">Add some layers</p>

    <p class="mt-4 text-center">
      <BaseButton @click="addLayer" large primary>Add new layer</BaseButton>
    </p>

    <ul class="divide-y divide-gray-300">
      <li v-for="layer in layers" :key="layer.id" class="block py-4">
        <button type="button" @click="activeLayer = layer">
          <span :class="[activeLayer?.id === layer.id && 'font-bold']">
            {{ layer.name }}
          </span>
        </button>
      </li>
    </ul>
    <BaseButton @click="activeLayer = null">Clear active layer</BaseButton>
  </div>
  <Teleport :to="mapRef.getTargetElement()">
    <MapEditToolbar
      v-if="isActive"
      :ol-map="mapRef"
      :layer="vectorLayer"
      class="absolute left-3 top-[150px]"
    />
  </Teleport>
</template>
