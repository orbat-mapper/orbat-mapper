<template>
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
      <span class="text-sm font-medium text-gray-700"><slot></slot></span>
    </SwitchLabel>
  </SwitchGroup>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Switch, SwitchGroup, SwitchLabel } from "@headlessui/vue";
import { useVModel } from "@vueuse/core";

export default defineComponent({
  name: "ToggleField",
  components: {
    Switch,
    SwitchGroup,
    SwitchLabel,
  },
  props: { modelValue: Boolean },
  emits: ["update:modelValue"],
  setup(props) {
    const enabled = useVModel(props, "modelValue");

    return {
      enabled,
    };
  },
});
</script>
