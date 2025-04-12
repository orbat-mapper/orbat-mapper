<template>
  <SimpleModal v-model="open" :dialog-title="dialogTitle" @cancel="emit('cancel')">
    <TabView class="">
      <TabItem label="Time">
        <form @submit.prevent="updateTime" class="mt-4 space-y-6">
          <div class="flex items-center justify-between">
            <DescriptionItem label="Time zone name">
              {{ timeZone }}
            </DescriptionItem>
            <ToggleField v-model="enabled">UTC mode</ToggleField>
          </div>
          <InputGroup :id="focusId" label="Date" type="date" v-model="date"></InputGroup>
          <div class="flex space-x-4">
            <InputGroup label="Hour" v-model="hour" type="number" min="0" max="23" />
            <InputGroup label="Minute" v-model="minute" type="number" min="0" max="59" />
          </div>

          <p class="flex items-center justify-between">
            <span class="font-mono text-gray-700">{{ resDateTime.format() }}</span>
            <PrimaryButton type="submit" class="">Update time</PrimaryButton>
          </p>
        </form>
      </TabItem>
      <TabItem label="Events">
        <ScenarioEventsPanel select-only @event-click="onEventClick" />
      </TabItem>
    </TabView>
  </SimpleModal>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useStorage, useVModel } from "@vueuse/core";

import SimpleModal from "./SimpleModal.vue";
import PrimaryButton from "./PrimaryButton.vue";
import InputGroup from "./InputGroup.vue";
import DescriptionItem from "./DescriptionItem.vue";
import { useDateElements } from "@/composables/scenarioTime";
import { useFocusOnMount } from "@/components/helpers";
import TabView from "@/components/TabView.vue";
import TabItem from "@/components/TabItem.vue";
import ScenarioEventsPanel from "@/modules/scenarioeditor/ScenarioEventsPanel.vue";
import { type ScenarioEvent } from "@/types/scenarioModels";
import ToggleField from "@/components/ToggleField.vue";

interface Props {
  dialogTitle?: string;
  timestamp?: number;
  modelValue?: boolean;
  timeZone?: string;
}

const props = withDefaults(defineProps<Props>(), {
  dialogTitle: "Set scenario date and time",
  timestamp: 386467200000,
  modelValue: false,
  timeZone: "UTC",
});
const emit = defineEmits(["update:modelValue", "update:timestamp", "cancel"]);

const { focusId } = useFocusOnMount(undefined, 150);

const open = useVModel(props, "modelValue");
const enabled = useStorage("utc-mode", false);
const isLocal = computed(() => !enabled.value);
const { date, hour, minute, resDateTime } = useDateElements({
  timestamp: props.timestamp,
  isLocal,
  timeZone: props.timeZone,
});

const updateTime = () => {
  emit("update:timestamp", resDateTime.value.valueOf());
  open.value = false;
};

function onEventClick(event: ScenarioEvent) {
  emit("update:timestamp", event.startTime);
  open.value = false;
}
</script>
