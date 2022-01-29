<template>
  <div>
    <p class="text-xs font-medium uppercase tracking-wider text-gray-500">Base layers</p>

    <BaseLayerSwitcher
      class="mt-4"
      :settings="tileLayers"
      v-model="activeBaseLayer"
      @update:layer-opacity="updateOpacity"
    />

    <p class="mt-4 text-xs font-medium uppercase tracking-wider text-gray-500">
      Other layers
    </p>

    <div class="mt-4 overflow-hidden rounded-md bg-white shadow">
      <ul class="divide-y divide-gray-200">
        <li v-for="layer in vectorLayers" :key="layer.title" class="px-6 py-4">
          <div class="flex items-center justify-between">
            <p class="flex-auto truncate text-sm">{{ layer.title }}</p>
            <div class="ml-2 flex flex-shrink-0 items-center">
              <OpacityInput
                :model-value="layer.opacity"
                @update:model-value="updateOpacity(layer, $event)"
              />
              <button class="ml-4 h-5 w-5 text-gray-500" @click="toggleLayer(layer)">
                <EyeIcon v-if="layer.visible" />
                <EyeOffIcon v-else />
              </button>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <div class="mt-4">
      <p>For debugging:</p>
      <pre class="text-sm">{{ mapView }}</pre>
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
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import LayerGroup from "ol/layer/Group";
import { EyeIcon, EyeOffIcon } from "@heroicons/vue/solid";
import BaseLayerSwitcher from "./BaseLayerSwitcher.vue";
import { AnyTileLayer, AnyVectorLayer, PointVectorLayer } from "../geo/types";
import TileSource from "ol/source/Tile";
import { toLonLat } from "ol/proj";
import OpacityInput from "./OpacityInput.vue";

export interface LayerInfo<T extends BaseLayer = BaseLayer> {
  title: string;
  visible: boolean;
  zIndex: number;
  opacity: number;
  layer: T;
  subLayers?: LayerInfo<T>[];
  description?: string;
}

export default defineComponent({
  name: "LayersPanel",
  components: {
    OpacityInput,
    BaseLayerSwitcher,
    EyeIcon,
    EyeOffIcon,
  },
  setup() {
    const geoStore = useGeoStore();
    let tileLayers = ref<LayerInfo<TileLayer<TileSource>>[]>([]);
    let vectorLayers = ref<LayerInfo<PointVectorLayer>[]>([]);
    let activeBaseLayer = shallowRef<LayerInfo<TileLayer<TileSource>>>();

    const mapView = computed(() => {
      if (!geoStore.olMap) return;
      const view = geoStore.olMap.getView();
      return {
        center: toLonLat(view.getCenter() || [0, 0], view.getProjection()),
        zoom: view.getZoom(),
      };
    });

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
        l.layer.setOpacity(layerInfo.opacity);
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
        ({ layer }) => layer instanceof VectorLayer || layer instanceof LayerGroup
      ) as LayerInfo<AnyVectorLayer>[];
    };

    const toggleLayer = (l: LayerInfo<any>) => {
      l.visible = !l.visible;
      l.layer.setOpacity(l.opacity);
      l.layer.setVisible(l.visible);
    };

    const baseLayers = computed(() =>
      tileLayers.value.map((l) => ({ ...l, name: l.title, description: "" }))
    );

    function updateOpacity(l: LayerInfo<any>, opacity: number) {
      l.opacity = opacity;
      l.layer.setOpacity(opacity);
    }

    return {
      vectorLayers,
      tileLayers,
      toggleLayer,
      baseLayers,
      activeBaseLayer,
      mapView,
      updateOpacity,
    };
  },
});
</script>
