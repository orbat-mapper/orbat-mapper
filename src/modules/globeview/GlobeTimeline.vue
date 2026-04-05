<script setup lang="ts">
import { provide } from "vue";
import { activeScenarioKey } from "@/components/injects";
import type { TScenario } from "@/scenariostore";
import ScenarioTimeline from "@/modules/scenarioeditor/ScenarioTimeline.vue";

const props = defineProps<{ activeScenario: TScenario }>();

provide(activeScenarioKey, props.activeScenario);
</script>

<template>
  <ScenarioTimeline />
</template>
