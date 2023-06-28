<script setup lang="ts">
import { ScenarioTileJSONLayer, ScenarioXYZLayer } from "@/types/scenarioGeoModels";
import InputGroup from "@/components/InputGroup.vue";
import { computed, ref, watch } from "vue";
import BaseButton from "@/components/BaseButton.vue";
import { getChangedValues, nanoid } from "@/utils";
import { useFocusOnMount } from "@/components/helpers";
import TileMapLayerSettingsForm from "@/modules/scenarioeditor/TileMapLayerSettingsForm.vue";
import DescriptionItem from "@/components/DescriptionItem.vue";
import {
  ScenarioMapLayerUpdate,
  ScenarioTileJSONLayerUpdate,
  ScenarioXYZLayerUpdate,
} from "@/types/internalModels";

interface Props {
  layer: ScenarioTileJSONLayer | ScenarioXYZLayer;
}
const props = defineProps<Props>();
const emit = defineEmits(["update", "action"]);

const isInitialized = computed(() => props.layer._status === "initialized");
const status = computed(() => props.layer._status);
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
  { immediate: true }
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
      <span class="badge">{{ layer.type }}</span>
    </header>
    <TileMapLayerSettingsForm
      v-if="editMode"
      :key="layer.id"
      :layer="layer"
      @cancel="editMode = false"
      @update="updateData"
    />
    <div v-else>
      <DescriptionItem :label="urlLabel">{{ layer.url || "Not set" }}</DescriptionItem>
      <footer class="mt-4 flex justify-end space-x-2">
        <BaseButton small type="button" @click="editMode = true">Edit</BaseButton>
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
