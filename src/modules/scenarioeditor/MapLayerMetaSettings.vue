<script setup lang="ts">
import {
  ScenarioMapLayer,
  ScenarioTileJSONLayer,
  ScenarioXYZLayer,
} from "@/types/scenarioGeoModels";
import { computed, ref, watch } from "vue";
import BaseButton from "@/components/BaseButton.vue";
import { getChangedValues } from "@/utils";
import TileMapLayerSettingsForm from "@/modules/scenarioeditor/TileMapLayerSettingsForm.vue";
import DescriptionItem from "@/components/DescriptionItem.vue";
import {
  ScenarioMapLayerUpdate,
  ScenarioTileJSONLayerUpdate,
  ScenarioXYZLayerUpdate,
} from "@/types/internalModels";
import { useMapLayerInfo } from "@/composables/geoMapLayers";
import MapLayerMetaSettingsForm from "@/modules/scenarioeditor/MapLayerMetaSettingsForm.vue";

interface Props {
  layer: ScenarioMapLayer;
}
const props = defineProps<Props>();
const emit = defineEmits(["update", "action"]);
const { status, isInitialized, layerTypeLabel } = useMapLayerInfo(props.layer);

watch(status, (v) => {
  if (v === "initialized") {
    emit("action", "zoom");
  }
});

const editMode = ref(false);

watch(
  () => props.layer,
  (v) => {
    editMode.value = props.layer._isNew ?? false;
  },
  { immediate: true },
);
function updateData(formData: ScenarioMapLayerUpdate) {
  const diff = getChangedValues({ ...formData }, props.layer);
  emit("update", diff);
  editMode.value = false;
}
</script>

<template>
  <section class="mt-2">
    <MapLayerMetaSettingsForm
      v-if="editMode"
      :key="layer.id"
      :layer="layer"
      @cancel="editMode = false"
      @update="updateData"
    />
    <div v-else class="space-y-4">
      <DescriptionItem label="Description">
        <p class="whitespace-pre-wrap">{{ layer.description || "Not set" }}</p>
      </DescriptionItem>
      <DescriptionItem v-if="layer.externalUrl" label="External URL" dd-class="truncate"
        ><a target="_blank" class="underline" :href="layer.externalUrl">{{
          layer.externalUrl
        }}</a></DescriptionItem
      >
      <footer class="mt-4 flex justify-end space-x-2 pb-1">
        <BaseButton small type="button" @click="editMode = true">Edit</BaseButton>
      </footer>
    </div>
  </section>
</template>
