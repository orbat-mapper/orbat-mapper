<script setup lang="ts">
import { computed } from "vue";
import { useStorage } from "@vueuse/core";
import PrimaryButton from "./PrimaryButton.vue";
import InputGroup from "./InputGroup.vue";
import DescriptionItem from "./DescriptionItem.vue";
import { useDateElements } from "@/composables/scenarioTime";
import { useFocusOnMount } from "@/components/helpers";
import ScenarioEventsPanel from "@/modules/scenarioeditor/ScenarioEventsPanel.vue";
import { type ScenarioEvent } from "@/types/scenarioModels";
import ToggleField from "@/components/ToggleField.vue";
import NewSimpleModal from "@/components/NewSimpleModal.vue";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
const emit = defineEmits(["update:timestamp", "cancel"]);

const { focusId } = useFocusOnMount(undefined, 150);

const open = defineModel<boolean>();
const enabled = useStorage("utc-mode", false);
const isLocal = computed(() => !enabled.value);
const { date, hour, minute, resDateTime } = useDateElements({
  timestamp: props.timestamp,
  isLocal,
  timeZone: props.timeZone,
});
const activeTimestamp = computed(() => resDateTime.value.valueOf());

const updateTime = () => {
  emit("update:timestamp", resDateTime.value.valueOf());
  open.value = false;
};

function onEventClick(event: ScenarioEvent) {
  emit("update:timestamp", event.startTime);
  open.value = false;
}
</script>
<template>
  <NewSimpleModal v-model="open" :dialog-title="dialogTitle" @cancel="emit('cancel')">
    <Tabs class="" default-value="time">
      <TabsList class="w-full">
        <TabsTrigger value="time" class="">Time</TabsTrigger>
        <TabsTrigger value="events" class="">Events </TabsTrigger>
      </TabsList>
      <TabsContent value="time">
        <form @submit.prevent="updateTime" class="mt-4 space-y-6">
          <div class="flex items-center justify-between">
            <DescriptionItem label="Time zone name">
              {{ timeZone }}
            </DescriptionItem>
            <ToggleField v-model="enabled">UTC mode</ToggleField>
          </div>
          <InputGroup :id="focusId" label="Date" type="date" v-model="date" />
          <div class="flex space-x-4">
            <InputGroup label="Hour" v-model="hour" type="number" min="0" max="23" />
            <InputGroup label="Minute" v-model="minute" type="number" min="0" max="59" />
          </div>

          <p class="flex items-center justify-between">
            <span class="text-muted-foreground font-mono">{{
              resDateTime.format()
            }}</span>
            <PrimaryButton type="submit" class="">Update time</PrimaryButton>
          </p>
        </form>
      </TabsContent>
      <TabsContent value="events">
        <ScenarioEventsPanel
          select-only
          hide-dropdown
          :highlight-timestamp="activeTimestamp"
          @event-click="onEventClick"
        />
      </TabsContent>
    </Tabs>
  </NewSimpleModal>
</template>
