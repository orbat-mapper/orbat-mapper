<script setup lang="ts">
import { IconMagnifyExpand as ZoomIcon } from "@iconify-prerendered/vue-mdi";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { computed, ref, watch } from "vue";
import { FeatureId, ScenarioImageLayer } from "@/types/scenarioGeoModels";
import EditableLabel from "@/components/EditableLabel.vue";
import { ScenarioImageLayerUpdate } from "@/types/internalModels";
import InputGroup from "@/components/InputGroup.vue";
import IconButton from "@/components/IconButton.vue";
import { useEventBus } from "@vueuse/core";
import { imageLayerAction } from "@/components/eventKeys";
import DotsMenu from "@/components/DotsMenu.vue";
import { MenuItemData } from "@/components/types";
import { ScenarioMapLayerAction } from "@/types/constants";

interface Props {
  layerId: FeatureId;
}

const imageBus = useEventBus(imageLayerAction);

const props = defineProps<Props>();

const {
  geo,
  store: { groupUpdate },
} = injectStrict(activeScenarioKey);

const imageLayer = computed(() => geo.getMapLayerById(props.layerId));

const layerName = ref("DD");

const opacity = computed({
  get: () => imageLayer.value?.opacity,
  set: (v) => updateLayer({ opacity: v }),
});

const rotation = computed({
  get: () => imageLayer.value?.imageRotate ?? 0,
  set: (v) => updateLayer({ imageRotate: v }),
});

watch(
  () => imageLayer.value?.name,
  (v) => {
    layerName.value = v ?? "";
  },
  { immediate: true }
);

function updateValue(name: string, value: string) {
  imageLayer.value && geo.updateMapLayer(imageLayer.value.id, { [name]: value });
}

function updateLayer(data: ScenarioImageLayerUpdate) {
  imageLayer.value && geo.updateMapLayer(props.layerId, data);
}
const opacityAsPercent = computed(() => (opacity.value! * 100).toFixed(0));

const imageLayerMenuItems: MenuItemData<ScenarioMapLayerAction>[] = [
  { label: "Zoom to", action: "zoom" },
  { label: "Delete", action: "delete" },
];

function onImageLayerAction(action: ScenarioMapLayerAction) {
  if (action === "zoom") imageBus.emit({ action, id: imageLayer.value.id });
}
</script>
<template>
  <div>
    <header class="">
      <div v-if="imageLayer" class="">
        <EditableLabel v-model="layerName" @update-value="updateValue('name', $event)" />
        <p class="whitespace-pre-wrap">{{ imageLayer.description }}</p>
        <div class="flex">
          <div class="flex flex-auto items-center">
            <input
              id="stroke-opacity"
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
            <IconButton @click="imageBus.emit({ action: 'zoom', id: layerId })">
              <ZoomIcon class="h-6 w-6" />
            </IconButton>
            <DotsMenu :items="imageLayerMenuItems" @action="onImageLayerAction" />
          </div>
        </div>
        <section class="mt-4 grid w-full grid-cols-1 gap-x-6 gap-y-2 text-sm">
          <InputGroup
            label="Rotation"
            v-model.number="rotation"
            type="range"
            min="-3"
            max="3"
            step="0.01"
            class=""
          >
          </InputGroup>
        </section>
      </div>
    </header>
  </div>
</template>
<style></style>
