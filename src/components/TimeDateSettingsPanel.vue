<script setup lang="ts">
import PanelHeading from "@/components/PanelHeading.vue";
import HeadingDesciption from "@/components/HeadingDescription.vue";
import { useTimeFormatSettingsStore, useTimeFormatStore } from "@/stores/timeFormatStore";
import { useActiveScenario } from "@/composables/scenarioUtils";
import { storeToRefs } from "pinia";
import AccordionPanel from "@/components/AccordionPanel.vue";
import TimeDateSettingsDetails from "@/components/TimeDateSettingsDetails.vue";

const { store } = useActiveScenario();

const currentTime = store.state.currentTime;
const { track, scenario } = storeToRefs(useTimeFormatSettingsStore());
const fmt = useTimeFormatStore();
</script>
<template>
  <PanelHeading>Time and date</PanelHeading>
  <HeadingDesciption
    >Choose how you want to format the scenario's time and date.</HeadingDesciption
  >
  <AccordionPanel label="Scenario datetime format">
    <template #closedContent>
      <span class="text-muted-foreground text-sm leading-7">
        {{ fmt.scenarioFormatter.format(currentTime) }}
      </span>
    </template>
    <TimeDateSettingsDetails
      :sample-time="fmt.scenarioFormatter.format(currentTime)"
      v-model="scenario"
    />
  </AccordionPanel>
  <AccordionPanel label="Map format">
    <template #closedContent>
      <span class="text-muted-foreground text-sm leading-7">
        {{ fmt.trackFormatter.format(currentTime) }}
      </span>
    </template>
    <TimeDateSettingsDetails
      :sample-time="fmt.trackFormatter.format(currentTime)"
      v-model="track"
    />
  </AccordionPanel>
</template>
