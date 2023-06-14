<script setup lang="ts">
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { computed, ref, watch } from "vue";
import { FeatureId } from "@/types/scenarioGeoModels";
import EditableLabel from "@/components/EditableLabel.vue";
import { ScenarioImageLayerUpdate } from "@/types/internalModels";

interface Props {
  layerId: FeatureId;
}

const props = defineProps<Props>();

const {
  geo,
  store: { groupUpdate },
} = injectStrict(activeScenarioKey);

const imageLayer = computed(() => geo.getImageLayerById(props.layerId));

const layerName = ref("DD");

const opacity = computed({
  get: () => imageLayer.value?.opacity,
  set: (v) => updateLayer({ opacity: v }),
});

watch(
  () => imageLayer.value?.name,
  (v) => {
    layerName.value = v ?? "";
  },
  { immediate: true }
);

function updateValue(name: string, value: string) {
  imageLayer.value && geo.updateImageLayer(imageLayer.value.id, { [name]: value });
}

function updateLayer(data: ScenarioImageLayerUpdate) {
  imageLayer.value && geo.updateImageLayer(props.layerId, data);
}
const opacityAsPercent = computed(() => (opacity.value! * 100).toFixed(0));
</script>
<template>
  <div>
    <header class="">
      <div v-if="imageLayer" class="">
        <EditableLabel v-model="layerName" @update-value="updateValue('name', $event)" />
        <p class="whitespace-pre-wrap">{{ imageLayer.description }}</p>
        <section class="mt-4 grid w-full grid-cols-3 gap-x-6 gap-y-2 text-sm">
          <label for="stroke-opacity">Opacity</label>
          <input
            id="stroke-opacity"
            v-model.number="opacity"
            type="range"
            min="0"
            max="1"
            step="0.01"
            class="w-28"
          />
          <span class="">{{ opacityAsPercent }}%</span>
        </section>
      </div>
    </header>
  </div>
</template>
