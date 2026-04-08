<script setup lang="ts">
import { provide } from "vue";
import MapEditorDetailsPanel from "@/modules/scenarioeditor/MapEditorDetailsPanel.vue";
import DetailsPanelContent from "@/modules/scenarioeditor/DetailsPanelContent.vue";
import { activeScenarioKey } from "@/components/injects";
import type { TScenario } from "@/scenariostore";
import type { DetailsPanelMode } from "@/stores/uiStore";

const props = defineProps<{
  activeScenario: TScenario;
  mode: DetailsPanelMode;
}>();

const emit = defineEmits<{ close: [] }>();

provide(activeScenarioKey, props.activeScenario);
</script>

<template>
  <MapEditorDetailsPanel :mode @close="emit('close')">
    <DetailsPanelContent />
  </MapEditorDetailsPanel>
</template>
