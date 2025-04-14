<script setup lang="ts">
import type { ScenarioTileJSONLayer, ScenarioXYZLayer } from "@/types/scenarioGeoModels";
import { computed, ref, watch } from "vue";
import { getChangedValues } from "@/utils";
import TileMapLayerSettingsForm from "@/modules/scenarioeditor/TileMapLayerSettingsForm.vue";
import DescriptionItem from "@/components/DescriptionItem.vue";
import type {
  ScenarioTileJSONLayerUpdate,
  ScenarioXYZLayerUpdate,
} from "@/types/internalModels";
import { useMapLayerInfo } from "@/composables/geoMapLayers";
import { Button } from "@/components/ui/button";

interface Props {
  layer: ScenarioTileJSONLayer | ScenarioXYZLayer;
}
const props = defineProps<Props>();
const emit = defineEmits(["update", "action"]);
const { status, isInitialized, layerTypeLabel } = useMapLayerInfo(props.layer);

const urlLabel = computed(() => {
  if (props.layer.type === "TileJSONLayer") {
    return "TileJSON URL";
  } else {
    return "XYZ tile URL template";
  }
});

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
function updateData(formData: ScenarioTileJSONLayerUpdate | ScenarioXYZLayerUpdate) {
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
      <DescriptionItem :label="urlLabel" dd-class="truncate">{{
        layer.url || "Not set"
      }}</DescriptionItem>
      <footer class="mt-4 flex justify-end space-x-2">
        <Button variant="outline" size="sm" @click="editMode = true">Edit</Button>
      </footer>
    </div>
    <p v-if="!isInitialized" class="mt-2 text-sm text-gray-500">
      This layer has not been initialized yet.
    </p>
    <p v-if="status === 'error'" class="mt-2 text-sm text-red-600">
      Failed to load layer.
    </p>
  </section>
</template>
