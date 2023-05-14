<template>
  <TransitionRoot :show="open" as="template" @after-leave="query = ''" appear>
    <Dialog as="div" class="relative z-10" @close="open = false">
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-gray-500 bg-opacity-25 transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 z-10 overflow-y-auto p-4 sm:p-6 md:p-20">
        <TransitionChild
          as="template"
          enter="ease-out duration-300"
          enter-from="opacity-0 scale-95"
          enter-to="opacity-100 scale-100"
          leave="ease-in duration-200"
          leave-from="opacity-100 scale-100"
          leave-to="opacity-0 scale-95"
        >
          <DialogPanel
            class="mx-auto max-w-xl transform divide-y divide-gray-100 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 transition-all"
          >
            <Combobox @update:modelValue="onSelect">
              <div class="relative">
                <MagnifyingGlassIcon
                  class="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
                <ComboboxInput
                  class="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                  placeholder="Search..."
                  @change="query = $event.target.value"
                />
              </div>

              <ComboboxOptions
                v-if="filteredItems.length > 0"
                static
                class="max-h-96 scroll-py-3 overflow-y-auto p-3"
              >
                <ComboboxOption
                  v-for="item in filteredItems"
                  :key="item.id"
                  :value="item"
                  as="template"
                  v-slot="{ active }"
                >
                  <li
                    :class="[
                      'flex cursor-default select-none  rounded-xl p-3',
                      active && 'bg-gray-100',
                    ]"
                  >
                    <div class="pt-1">
                      <component
                        :is="item.properties?.extent ? IconVectorSquare : IconMapMarker"
                        class="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </div>
                    <div class="ml-4 flex-auto">
                      <p
                        :class="[
                          'text-sm font-medium',
                          active ? 'text-gray-900' : 'text-gray-700',
                        ]"
                      >
                        {{ item.properties?.name }}
                      </p>
                      <p
                        :class="[
                          ' space-x-1 text-sm',
                          active ? 'text-gray-700' : 'text-gray-500',
                        ]"
                      >
                        <span class="text-xs">{{ item.properties?.osm_key }}</span>
                        <span>{{ item.properties?.city }}</span>
                        <span>{{ item.properties?.state }}</span>
                        <span>{{ item.properties?.country }}</span>
                      </p>
                    </div>
                  </li>
                </ComboboxOption>
              </ComboboxOptions>
            </Combobox>
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { MagnifyingGlassIcon } from "@heroicons/vue/20/solid";
import { IconMapMarker, IconVectorSquare } from "@iconify-prerendered/vue-mdi";
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Dialog,
  DialogPanel,
  TransitionChild,
  TransitionRoot,
} from "@headlessui/vue";
import OlPoint from "ol/geom/Point";
import { fromExtent as polygonFromExtent } from "ol/geom/Polygon";
import { useFetch, useVModel, watchDebounced } from "@vueuse/core";
import { Feature, FeatureCollection, Point } from "geojson";
import { injectStrict } from "@/utils";
import { activeMapKey } from "@/components/injects";
import { getTransform, toLonLat } from "ol/proj";
import { applyTransform } from "ol/extent";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import OlFeature from "ol/Feature";

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits(["update:modelValue"]);

const mapRef = injectStrict(activeMapKey);
const searchUrl = ref("");
const { data, isFetching, error, execute } = useFetch(searchUrl, {
  immediate: false,
})
  .get()
  .json<FeatureCollection<Point, any>>();

const filteredItems = ref<Feature<Point>[]>([]);

const open = useVModel(props, "modelValue", emit);
const query = ref("");
watchDebounced(
  query,
  async (q) => {
    if (q === "") return;
    searchUrl.value = `https://photon.komoot.io/api/?q=${q}&limit=10&lang=en`;
    const mapCenter = mapRef.value.getView().getCenter();
    if (mapCenter) {
      const [lon, lat] = toLonLat(mapCenter);
      searchUrl.value += `&lon=${lon}&lat=${lat}`;
    }
    await execute();
    filteredItems.value = data.value ? data.value.features : [];
  },
  { debounce: 500 }
);

function onSelect(item: Feature<Point>) {
  const map = mapRef.value;
  const transform = getTransform("EPSG:4326", map.getView().getProjection());

  const extent =
    item.properties?.extent && applyTransform(item.properties?.extent, transform);
  const polygon = extent && polygonFromExtent(extent);
  const p = new OlPoint(item.geometry.coordinates).transform(
    "EPSG:4326",
    map.getView().getProjection()
  ) as any;

  // add temporary layer
  const layer = new VectorLayer({
    source: new VectorSource({
      features: [new OlFeature({ geometry: polygon || p })],
    }),
    style: {
      "stroke-color": "#f00",
      "stroke-width": 2,
      "circle-radius": 12,
      "circle-stroke-color": "#f00",
      "circle-stroke-width": 4,
    },
  });
  layer.setMap(map);
  setTimeout(() => layer.setMap(null), 2000);

  map.getView().fit(polygon || p, { maxZoom: 15 });
  open.value = false;
}
</script>
