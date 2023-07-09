<script setup lang="ts">
import {
  IconEye,
  IconEyeOff,
  IconMagnifyExpand as ZoomIcon,
} from "@iconify-prerendered/vue-mdi";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { computed, ref, watch } from "vue";
import { FeatureId, ScenarioMapLayer } from "@/types/scenarioGeoModels";
import EditableLabel from "@/components/EditableLabel.vue";
import { ScenarioMapLayerUpdate } from "@/types/internalModels";
import IconButton from "@/components/IconButton.vue";
import { useDebounceFn, useEventBus } from "@vueuse/core";
import { imageLayerAction } from "@/components/eventKeys";
import DotsMenu from "@/components/DotsMenu.vue";
import { MenuItemData } from "@/components/types";
import { ScenarioMapLayerAction } from "@/types/constants";
import { getMapLayerIcon } from "@/modules/scenarioeditor/scenarioMapLayers";
import { useSelectedItems } from "@/stores/selectedStore";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/vue";
import ImageMapLayerSettings from "@/modules/scenarioeditor/ImageMapLayerSettings.vue";
import TileJSONMapLayerSettings from "@/modules/scenarioeditor/TileMapLayerSettings.vue";
import { LayerUpdateOptions } from "@/composables/geoMapLayers";
import { useUiStore } from "@/stores/uiStore";

interface Props {
  layerId: FeatureId;
}

const props = defineProps<Props>();

const imageBus = useEventBus(imageLayerAction);
const uiStore = useUiStore();
const {
  geo,
  store: { groupUpdate },
} = injectStrict(activeScenarioKey);

const { clear } = useSelectedItems();

const mapLayer = computed(() => geo.getMapLayerById(props.layerId) as ScenarioMapLayer);
const isVisible = computed(() => !(mapLayer.value?.isHidden ?? false));
const layerName = ref("DD");
const selectedTab = ref(0);

function changeTab(index: number) {
  selectedTab.value = index;
}

const opacity = computed({
  get: () => mapLayer.value?.opacity,
  set: (v) => updateLayer({ opacity: v }, { undoable: false, debounce: false }),
});

watch(
  () => mapLayer.value?.name,
  (v) => {
    layerName.value = v ?? "";
  },
  { immediate: true }
);

watch(
  mapLayer,
  (v) => {
    if (v && v._isNew) selectedTab.value = 1;
  },
  { immediate: true }
);

const tabList = computed(() =>
  uiStore.debugMode ? ["Details", "Settings", "Debug"] : ["Details", "Settings"]
);

function updateValue(name: string, value: string) {
  mapLayer.value && geo.updateMapLayer(mapLayer.value.id, { [name]: value });
}

const debouncedUpdate = useDebounceFn((data: ScenarioMapLayerUpdate) => {
  geo.updateMapLayer(props.layerId, data, { noEmit: true });
}, 500);

function updateLayer(data: ScenarioMapLayerUpdate, options: LayerUpdateOptions = {}) {
  const debounce = options.debounce ?? false;
  const undoable = options.undoable ?? !debounce;
  debounce && debouncedUpdate(data);
  mapLayer.value &&
    geo.updateMapLayer(props.layerId, data, { undoable, emitOnly: debounce });
}
const opacityAsPercent = computed(() => (opacity.value! * 100).toFixed(0));

const imageLayerMenuItems: MenuItemData<ScenarioMapLayerAction>[] = [
  { label: "Zoom to", action: "zoom" },
  { label: "Delete", action: "delete" },
];

function onImageLayerAction(action: ScenarioMapLayerAction) {
  if (action === "zoom") imageBus.emit({ action, id: mapLayer.value.id });
  if (action === "delete") {
    geo.deleteMapLayer(mapLayer.value.id);
    clear();
  }
}

function toggleLayerVisibility() {
  updateLayer({ isHidden: !(mapLayer.value.isHidden ?? false) });
}
</script>
<template>
  <div>
    <header class="">
      <div v-if="mapLayer" class="">
        <EditableLabel v-model="layerName" @update-value="updateValue('name', $event)" />
        <p class="whitespace-pre-wrap">{{ mapLayer.description }}</p>
        <div class="flex">
          <div class="flex flex-auto items-center">
            <component
              :is="getMapLayerIcon(mapLayer)"
              class="mr-2 h-7 w-7 text-gray-500"
            />
            <input
              v-model.number="opacity"
              type="range"
              min="0"
              max="1"
              step="0.01"
              class="transparent h-1 w-full cursor-pointer appearance-none rounded-lg border-transparent bg-red-800"
            />
            <span class="ml-2 w-8 flex-shrink-0 text-sm">{{ opacityAsPercent }}%</span>
          </div>
          <div class="ml-2 flex shrink-0 items-center">
            <IconButton
              @click="imageBus.emit({ action: 'zoom', id: layerId })"
              title="Zoom to layer extent"
            >
              <ZoomIcon class="h-6 w-6" />
            </IconButton>
            <IconButton @click="toggleLayerVisibility()" title="Toggle visibility">
              <IconEye v-if="isVisible" class="h-6 w-6" />
              <IconEyeOff v-else class="h-6 w-6" />
            </IconButton>
            <DotsMenu :items="imageLayerMenuItems" @action="onImageLayerAction" />
          </div>
        </div>
        <TabGroup
          :selected-index="selectedTab"
          @change="changeTab"
          class="-mx-4 mt-2"
          as="div"
        >
          <TabList class="mb-2 flex space-x-4 border-b-2 px-4" v-slot="{ selectedIndex }">
            <Tab
              v-for="(tab, i) in tabList"
              :class="[
                selectedIndex === i ? 'border-army  text-army' : 'border-transparent',
                'border-b-2 px-1 py-2 ',
              ]"
              >{{ tab }}</Tab
            >
          </TabList>
          <TabPanels class="w-full overflow-auto px-4">
            <TabPanel> dtails </TabPanel>
            <TabPanel>
              <ImageMapLayerSettings
                v-if="mapLayer.type === 'ImageLayer'"
                :layer="mapLayer"
                :key="mapLayer.id"
                @update="updateLayer"
              />
              <TileJSONMapLayerSettings
                v-else-if="
                  mapLayer.type === 'TileJSONLayer' || mapLayer.type === 'XYZLayer'
                "
                :layer="mapLayer"
                @update="updateLayer"
                @action="onImageLayerAction"
              />
            </TabPanel>
            <TabPanel v-if="uiStore.debugMode" class="prose prose-sm max-w-none">
              <pre>{{ mapLayer }}</pre>
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
    </header>
  </div>
</template>
<style></style>
