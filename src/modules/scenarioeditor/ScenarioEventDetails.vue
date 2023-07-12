<script setup lang="ts">
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { EntityId } from "@/types/base";
import { computed, ref, watch } from "vue";
import EditableLabel from "@/components/EditableLabel.vue";

interface Props {
  eventId: EntityId;
}

const props = defineProps<Props>();

const {
  time: { updateScenarioEvent },
} = injectStrict(activeScenarioKey);

const title = ref("");

const {
  geo,
  store: { groupUpdate },
  time,
} = injectStrict(activeScenarioKey);

const scenarioEvent = computed(() => time.getEventById(props.eventId));

watch(
  () => props.eventId,
  () => {
    title.value = scenarioEvent.value?.title ?? "";
  },
  { immediate: true },
);

function updateTitle(value: string) {
  updateScenarioEvent(props.eventId, { title: value });
}
</script>
<template>
  <div v-if="scenarioEvent" :key="scenarioEvent.id">
    <header class="">
      <EditableLabel v-model="title" @updateValue="updateTitle" />
    </header>
    <pre>{{ scenarioEvent }}</pre>
  </div>
</template>
