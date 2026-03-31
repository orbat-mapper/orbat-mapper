<script setup lang="ts">
import { defineAsyncComponent, provide, ref } from "vue";
import MapEditorDesktopPanel from "@/modules/scenarioeditor/MapEditorDesktopPanel.vue";
import {
  activeLayerKey,
  activeNativeMapKey,
  activeScenarioKey,
  timeModalKey,
} from "@/components/injects";
import type { TScenario } from "@/scenariostore";
import { useDateModal } from "@/composables/modals";
import type { FeatureId } from "@/types/scenarioGeoModels";
import type OLMap from "ol/Map";
import type { ShallowRef } from "vue";

const InputDateModal = defineAsyncComponent(
  () => import("@/components/InputDateModal.vue"),
);

const props = defineProps<{ activeScenario: TScenario }>();
const emit = defineEmits<{ close: [] }>();

provide(activeScenarioKey, props.activeScenario);

const activeLayerId = ref<FeatureId | undefined | null>(null);
provide(activeLayerKey, activeLayerId);

// Stub for activeNativeMapKey — layers panel needs it but OL features aren't available
const nativeMapStub = ref(null) as unknown as ShallowRef<OLMap>;
provide(activeNativeMapKey, nativeMapStub);

const {
  showDateModal,
  confirmDateModal,
  cancelDateModal,
  initialDateModalValue,
  dateModalTimeZone,
  dateModalTitle,
  getModalTimestamp,
} = useDateModal();

provide(timeModalKey, { getModalTimestamp });
</script>

<template>
  <div class="flex h-full">
    <MapEditorDesktopPanel @close="emit('close')" />
    <InputDateModal
      v-if="showDateModal"
      v-model="showDateModal"
      :dialog-title="dateModalTitle"
      :timestamp="initialDateModalValue"
      @update:timestamp="confirmDateModal($event)"
      :time-zone="dateModalTimeZone"
      @cancel="cancelDateModal"
    />
  </div>
</template>
