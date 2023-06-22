<script setup lang="ts">
import { ScenarioTileJSONLayer, ScenarioXYZLayer } from "@/types/scenarioGeoModels";
import InputGroup from "@/components/InputGroup.vue";
import { computed, ref, watch } from "vue";
import BaseButton from "@/components/BaseButton.vue";
import { getChangedValues } from "@/utils";

interface Props {
  layer: ScenarioTileJSONLayer | ScenarioXYZLayer;
}
const props = defineProps<Props>();
const emit = defineEmits(["update", "action"]);

const formData = ref({ url: props.layer.url, attributions: props.layer.attributions });

watch(
  () => props.layer,
  (v) => {
    formData.value = { url: v.url, attributions: v.attributions };
  },
  { immediate: true }
);

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

function updateData() {
  const diff = getChangedValues({ ...formData.value }, props.layer);
  emit("update", diff);
}
</script>

<template>
  <form @submit.prevent="updateData" class="p-1">
    <header class="flex justify-end">
      <span class="badge">{{ layer.type }}</span>
    </header>
    <div class="space-y-4">
      <InputGroup
        :label="urlLabel"
        type="text"
        class=""
        v-model="formData.url"
        required
      />
      <InputGroup
        v-if="layer.type === 'XYZLayer'"
        label="Attributions"
        type="text"
        class=""
        v-model="formData.attributions"
      />
    </div>
    <footer class="mt-4 flex justify-end">
      <BaseButton small primary type="submit">Update</BaseButton>
    </footer>
    <p v-if="!isInitialized" class="mt-2 text-sm text-gray-500">
      This layer has not been initialized yet.
    </p>
    <p v-if="status === 'error'" class="mt-2 text-sm text-red-600">
      Failed to load layer.
    </p>
  </form>
</template>
