<script setup lang="ts">
import { GlobalEvents } from "vue-global-events";
import { computed } from "vue";
import { useUiStore } from "@/stores/uiStore";
import { inputEventFilter } from "@/components/helpers";
import { injectStrict } from "@/utils";
import { activeScenarioKey, activeUnitKey } from "@/components/injects";
import {
  useActiveUnitStore,
  useSelectedFeatures,
  useSelectedUnits,
} from "@/stores/dragStore";

const activeUnitId = injectStrict(activeUnitKey);
const { unitActions } = injectStrict(activeScenarioKey);
const uiStore = useUiStore();
const activeUnitStore = useActiveUnitStore();
const { clear: clearSelectedUnits } = useSelectedUnits();
const { clear: clearSelectedFeatures } = useSelectedFeatures();

const shortcutsEnabled = computed(() => !uiStore.modalOpen);

const createNewUnit = () => {
  activeUnitId.value && unitActions.createSubordinateUnit(activeUnitId.value);
};

const duplicateUnit = () => {
  activeUnitId.value && unitActions.cloneUnit(activeUnitId.value);
};

function handleEscape(e: KeyboardEvent) {
  if (uiStore.escEnabled) {
    clearSelectedUnits();
    activeUnitStore.clearActiveUnit();
    clearSelectedFeatures();
  }
}
</script>

<template>
  <GlobalEvents
    v-if="shortcutsEnabled"
    :filter="inputEventFilter"
    @keyup.c="createNewUnit"
    @keyup.d="duplicateUnit"
    @keydown.esc="handleEscape"
  />
</template>
