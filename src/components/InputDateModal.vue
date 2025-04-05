<template>
  <SimpleModal v-model="open" :dialog-title="dialogTitle" @cancel="emit('cancel')">
    <TabView class="">
      <TabItem label="Time">
        <form @submit.prevent="updateTime" class="mt-4 space-y-6">
          <div class="flex items-center justify-between">
            <DescriptionItem label="Time zone name">
              {{ timeZone }}
            </DescriptionItem>

            <SwitchGroup as="div" class="flex items-center">
              <Switch
                v-model="enabled"
                :class="[
                  enabled ? 'bg-indigo-600' : 'bg-gray-200',
                  'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden',
                ]"
              >
                <span
                  aria-hidden="true"
                  :class="[
                    enabled ? 'translate-x-5' : 'translate-x-0',
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out',
                  ]"
                />
              </Switch>
              <SwitchLabel as="span" class="ml-3">
                <span class="text-sm font-medium text-gray-900">UTC mode</span>
              </SwitchLabel>
            </SwitchGroup>
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
import { Switch, SwitchGroup, SwitchLabel } from "@headlessui/vue";

import SimpleModal from "./SimpleModal.vue";
import PrimaryButton from "./PrimaryButton.vue";
import InputGroup from "./InputGroup.vue";
import DescriptionItem from "./DescriptionItem.vue";
import { useDateElements } from "@/composables/scenarioTime";
import { useFocusOnMount } from "@/components/helpers";
import TabView from "@/components/TabView.vue";
import TabItem from "@/components/TabItem.vue";
import ScenarioEventsPanel from "@/modules/scenarioeditor/ScenarioEventsPanel.vue";
import { ScenarioEvent } from "@/types/scenarioModels";

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
