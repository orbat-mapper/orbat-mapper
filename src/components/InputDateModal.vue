<template>
  <SimpleModal v-model="open" :dialog-title="dialogTitle">
    <form @submit.prevent="updateTime" class="mt-4 space-y-6">
      <SwitchGroup as="div" class="flex items-center">
        <Switch
          v-model="enabled"
          :class="[
            enabled ? 'bg-indigo-600' : 'bg-gray-200',
            'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
          ]"
        >
          <span
            aria-hidden="true"
            :class="[
              enabled ? 'translate-x-5' : 'translate-x-0',
              'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200',
            ]"
          />
        </Switch>
        <SwitchLabel as="span" class="ml-3">
          <span class="text-sm font-medium text-gray-900">UTC mode</span>
        </SwitchLabel>
      </SwitchGroup>
      <InputGroup label="Date" type="date" v-model="date"></InputGroup>
      <div class="flex space-x-4">
        <InputGroup
          label="Hour"
          v-model="hour"
          type="number"
          min="0"
          max="23"
        />
        <InputGroup
          label="Minute"
          v-model="minute"
          type="number"
          min="0"
          max="59"
        />
      </div>

      <p class="flex justify-between items-center">
        <span class="text-gray-700 font-mono">{{ resDateTime.format() }}</span>
        <PrimaryButton type="submit" class="">Update time</PrimaryButton>
      </p>
    </form>
  </SimpleModal>
</template>

<script lang="ts">
import SimpleModal from "./SimpleModal.vue";
import { useVModel } from "@vueuse/core";
import { Switch, SwitchGroup, SwitchLabel } from "@headlessui/vue";

import { computed, defineComponent, ref, watch } from "vue";
import { useScenarioStore } from "../stores/scenarioStore";
import dayjs from "dayjs";
import PrimaryButton from "./PrimaryButton.vue";
import InputGroup from "./InputGroup.vue";

export default defineComponent({
  components: {
    InputGroup,
    PrimaryButton,
    SimpleModal,
    Switch,
    SwitchGroup,
    SwitchLabel,
  },
  props: {
    dialogTitle: { type: String, default: "Set scenario date and time" },
    timestamp: { type: Number, default: 386467200000 },
    modelValue: { type: Boolean, default: false },
  },
  emits: ["update:modelValue", "update:timestamp"],

  setup(props, { emit }) {
    const open = useVModel(props, "modelValue");
    const date = ref("");
    const hour = ref(12);
    const minute = ref(0);
    const enabled = ref(false);
    const isLocal = computed(() => !enabled.value);
    const scenarioStore = useScenarioStore();

    const inputDateTime = computed(() => {
      return isLocal.value
        ? dayjs
            .utc(props.timestamp)
            .tz(scenarioStore.scenario.timeZone || "UTC")
        : dayjs.utc(props.timestamp);
    });
    watch(
      inputDateTime,
      (v) => {
        date.value = v.format().split("T")[0];
        hour.value = v.hour();
        minute.value = v.minute();
      },
      { immediate: true }
    );

    const resDateTime = computed(() => {
      try {
        if (isLocal.value)
          return dayjs.tz(
            `${date.value} ${hour.value}:${minute.value}`,
            scenarioStore.scenario.timeZone
          );
        return dayjs.utc(`${date.value} ${hour.value}:${minute.value}`);
      } catch (e) {
        return dayjs(0);
      }
    });

    const updateTime = () => {
      emit("update:timestamp", resDateTime.value.valueOf());
      open.value = false;
    };

    return {
      open,
      date,
      updateTime,
      hour,
      minute,
      resDateTime,
      enabled,
    };
  },
});
</script>
