<script setup lang="ts">
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { EntityId } from "@/types/base";
import { computed } from "vue";

interface Props {
  eventId: EntityId;
}

const props = defineProps<Props>();

const {
  geo,
  store: { groupUpdate },
  time,
} = injectStrict(activeScenarioKey);

const scenarioEvent = computed(() => time.getEventById(props.eventId));
</script>
<template>
  <div>
    <header class="">
      <p>Event</p>
    </header>
    <pre>{{ scenarioEvent }}</pre>
  </div>
</template>
