<script setup lang="ts">
import { ScenarioTileJSONLayer } from "@/types/scenarioGeoModels";
import InputGroup from "@/components/InputGroup.vue";
import { computed, ref, watch } from "vue";
import { ScenarioTileJSONLayerUpdate } from "@/types/internalModels";
import BaseButton from "@/components/BaseButton.vue";
import { watchOnce } from "@vueuse/core";
import { getChangedValues } from "@/utils";

interface Props {
  layer: ScenarioTileJSONLayer;
}
const props = defineProps<Props>();
const emit = defineEmits(["update", "action"]);

const formData = ref({ url: props.layer.url });

watch(
  () => props.layer,
  (v) => {
    formData.value = { url: v.url };
  },
  { immediate: true }
);

const isInitialized = computed(() => props.layer._status === "initialized");
const status = computed(() => props.layer._status);

watch(status, (v) => {
  if (v === "initialized") {
    emit("action", "zoom");
  }
});

function updateData() {
  const diff = getChangedValues(
    { ...formData.value } as ScenarioTileJSONLayerUpdate,
    props.layer
  );
  emit("update", diff);
}
</script>

<template>
  <form @submit.prevent="updateData" class="p-1">
    <header class="flex justify-end">
      <span class="badge">{{ layer.type }}</span>
    </header>
    <InputGroup
      label="TileJSON URL"
      type="text"
      class=""
      v-model="formData.url"
      required
    />
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
