<script setup lang="ts">
import type { ScenarioImageLayer } from "@/types/scenarioGeoModels";
import { activeScenarioMapEngineKey } from "@/components/injects";
import { injectStrict } from "@/utils";
import { onMounted, onUnmounted, ref, watch } from "vue";
import type {
  ScenarioImageLayerUpdate,
  ScenarioMapLayerUpdate,
} from "@/types/internalModels";
import { type LayerUpdateOptions, useMapLayerInfo } from "@/composables/geoMapLayers";
import { getChangedValues } from "@/utils";
import DescriptionItem from "@/components/DescriptionItem.vue";
import BaseButton from "@/components/BaseButton.vue";
import TileMapLayerSettingsForm from "@/modules/scenarioeditor/TileMapLayerSettingsForm.vue";

interface Props {
  layer: ScenarioImageLayer;
}
const props = defineProps<Props>();
const emit = defineEmits<{
  update: [d: ScenarioMapLayerUpdate, options?: LayerUpdateOptions];
}>();

const engineRef = injectStrict(activeScenarioMapEngineKey);
const editMode = ref((props.layer._isNew && !props.layer._isTemporary) ?? false);

const { layerTypeLabel, status, isInitialized } = useMapLayerInfo(props.layer);
const canTransformMapLayer = () =>
  Boolean(engineRef.value?.layers.capabilities.mapLayerTransform);
const canZoomMapLayer = () =>
  Boolean(engineRef.value?.layers.capabilities.zoomToMapLayer) &&
  Boolean(engineRef.value?.layers.capabilities.mapLayerExtent);

watch(status, (v) => {
  if (v === "initialized") {
    if (canZoomMapLayer()) {
      engineRef.value?.layers.zoomToMapLayer(props.layer.id);
    }
    if (canTransformMapLayer()) {
      engineRef.value?.layers.startMapLayerTransform(props.layer.id);
    }
  }
});

onMounted(() => {
  if (isInitialized.value && canTransformMapLayer()) {
    engineRef.value?.layers.startMapLayerTransform(props.layer.id);
  }
});

onUnmounted(() => {
  if (canTransformMapLayer()) {
    engineRef.value?.layers.endMapLayerTransform();
  }
});

watch(
  () => props.layer.id,
  (v) => {
    if (!canTransformMapLayer()) return;
    engineRef.value?.layers.endMapLayerTransform();
    engineRef.value?.layers.startMapLayerTransform(v);
  },
);

function updateData(formData: ScenarioImageLayerUpdate) {
  const diff = getChangedValues({ ...formData }, props.layer);
  emit("update", diff);
  editMode.value = false;
}
</script>

<template>
  <section>
    <header class="flex justify-end">
      <span class="badge">{{ layerTypeLabel }}</span>
    </header>
    <TileMapLayerSettingsForm
      v-if="editMode"
      :key="layer.id"
      :layer="layer"
      @cancel="editMode = false"
      @update="updateData"
    />
    <div v-else>
      <DescriptionItem label="Image URL"
        ><span class="break-all">{{ layer.url || "Not set" }}</span></DescriptionItem
      >
      <DescriptionItem label="Attributions" class="mt-4"
        ><span class="break-all">{{
          layer.attributions || "Not set"
        }}</span></DescriptionItem
      >
      <footer class="mt-4 flex justify-end space-x-2 pb-1">
        <BaseButton small type="button" @click="editMode = true">Edit</BaseButton>
      </footer>
    </div>
    <p v-if="!isInitialized" class="text-muted-foreground mt-2 text-sm">
      This layer has not been initialized yet.
    </p>
    <p v-if="status === 'error'" class="mt-2 text-sm text-red-600">
      Failed to load layer.
    </p>
    <p
      v-if="isInitialized && !canTransformMapLayer()"
      class="text-muted-foreground mt-2 text-sm"
    >
      Interactive image transform is not supported by this map engine.
    </p>
  </section>
</template>
