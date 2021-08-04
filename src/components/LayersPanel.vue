<template>
  <div>
    <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">
      Base layers
    </p>

    <BaseLayerSwitcher
      class="mt-4"
      :settings="tileLayers"
      v-model="activeBaseLayer"
    />

    <p class="text-xs font-medium text-gray-500 uppercase tracking-wider mt-4">
      Other layers
    </p>

    <div class="mt-4 bg-white shadow overflow-hidden rounded-md">
      <ul class="divide-y divide-gray-200">
        <li v-for="layer in vectorLayers" :key="layer.title" class="px-6 py-4">
          <div class="flex items-center justify-between">
            <p class="text-sm">{{ layer.title }}</p>
            <button class="h-5 w-5 text-gray-500" @click="toggleLayer(layer)">
              <EyeIcon v-if="layer.visible" />
              <EyeOffIcon v-else />
            </button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  markRaw,
  onMounted,
  ref,
  shallowRef,
  watch,
} from "vue";
import { useGeoStore } from "../stores/geoStore";
import BaseLayer from "ol/layer/Base";
import { EventsKey } from "ol/events";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import LayerGroup from "ol/layer/Group";
import { EyeIcon, EyeOffIcon } from "@heroicons/vue/solid";
import BaseLayerSwitcher from "./BaseLayerSwitcher.vue";
import { AnyTileLayer, AnyVectorLayer, PointVectorLayer } from "../geo/types";
import TileSource from "ol/source/Tile";
import VectorSource from "ol/source/Vector";

export interface LayerInfo<T extends BaseLayer = BaseLayer> {
  title: string;
  visible: boolean;
  zIndex: number;
  opacity: number;
  layer: T;
  subLayers?: LayerInfo<T>[];
}

export default defineComponent({
  name: "LayersPanel",
  components: { BaseLayerSwitcher, EyeIcon, EyeOffIcon },
  setup() {
    const geoStore = useGeoStore();
    let listeners: EventsKey[] = [];
    let tileLayers = shallowRef<LayerInfo<TileLayer<TileSource>>[]>([]);
    let vectorLayers = ref<LayerInfo<PointVectorLayer>[]>([]);
    let activeBaseLayer = shallowRef<LayerInfo<TileLayer<TileSource>>>();

    onMounted(() => {
      if (geoStore.olMap) updateLayers();
    });

    watch(
      () => geoStore.olMap,
      () => {
        if (!geoStore.olMap) return;
        updateLayers();
      }
    );

    watch(activeBaseLayer, (layerInfo) => {
      if (!layerInfo) return;
      tileLayers.value.forEach((l) => {
        const isVisible = l.title === layerInfo.title;
        l.visible = isVisible;
        l.layer.setVisible(isVisible);
      });
    });

    const updateLayers = () => {
      if (!geoStore.olMap) return;

      const mapLayer = (layer: BaseLayer): LayerInfo<BaseLayer> => {
        const l: LayerInfo<BaseLayer> = {
          title: layer.get("title"),
          visible: layer.getVisible(),
          zIndex: layer.getZIndex(),
          opacity: layer.getOpacity(),
          layer: markRaw(layer),
          subLayers: [],
        };
        if (layer instanceof LayerGroup) {
          l.subLayers = layer.getLayers().getArray().map(mapLayer);
        }
        return l;
      };
      const mappedLayers = geoStore.olMap.getLayers().getArray().map(mapLayer);
      tileLayers.value = mappedLayers.filter(
        ({ layer }) => layer instanceof TileLayer
      ) as LayerInfo<AnyTileLayer>[];

      activeBaseLayer.value = tileLayers.value.filter(
        (l) => l.visible
      )[0] as LayerInfo<AnyTileLayer>;

      vectorLayers.value = mappedLayers.filter(
        ({ layer }) =>
          layer instanceof VectorLayer || layer instanceof LayerGroup
      ) as LayerInfo<AnyVectorLayer>[];
    };

    const toggleLayer = (l: any) => {
      l.visible = !l.visible;
      l.layer.setVisible(l.visible);
    };

    const baseLayers = computed(() =>
      tileLayers.value.map((l) => ({ name: l.title, description: "" }))
    );

    return {
      vectorLayers,
      tileLayers,
      toggleLayer,
      baseLayers,
      activeBaseLayer,
    };
  },
});
</script>
