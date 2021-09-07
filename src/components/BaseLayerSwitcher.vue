<!--
  This example requires Tailwind CSS v2.0+

  This example requires some changes to your config:

  ```
  // tailwind.config.js
  module.exports = {
    // ...
    plugins: [
      // ...
      require('@tailwindcss/forms'),
    ]
  }
  ```
-->
<template>
  <RadioGroup v-model="selected">
    <RadioGroupLabel class="sr-only"> Privacy setting </RadioGroupLabel>
    <div class="bg-white rounded-md -space-y-px">
      <RadioGroupOption
        as="template"
        v-for="(setting, settingIdx) in settings"
        :key="setting.title"
        :value="setting"
        v-slot="{ checked, active }"
      >
        <div
          :class="[
            settingIdx === 0 ? 'rounded-tl-md rounded-tr-md' : '',
            settingIdx === settings.length - 1
              ? 'rounded-bl-md rounded-br-md'
              : '',
            checked ? 'bg-indigo-50 border-indigo-200 z-10' : 'border-gray-200',
            'relative border p-4 flex cursor-pointer focus:outline-none',
          ]"
        >
          <span
            class="flex-shrink-0"
            :class="[
              checked
                ? 'bg-indigo-600 border-transparent'
                : 'bg-white border-gray-300',
              active ? 'ring-2 ring-offset-2 ring-indigo-500' : '',
              'h-4 w-4 mt-0.5 cursor-pointer rounded-full border flex items-center justify-center',
            ]"
            aria-hidden="true"
          >
            <span class="rounded-full bg-white w-1.5 h-1.5" />
          </span>
          <div class="ml-3 flex flex-col">
            <RadioGroupLabel
              as="span"
              :class="[
                checked ? 'text-indigo-900' : 'text-gray-900',
                'block text-sm font-medium',
              ]"
            >
              {{ setting.title }}
            </RadioGroupLabel>
            <RadioGroupDescription
              as="span"
              :class="[
                checked ? 'text-indigo-700' : 'text-gray-500',
                'block text-sm',
              ]"
            >
              {{ setting.description || "" }}
            </RadioGroupDescription>
          </div>
        </div>
      </RadioGroupOption>
    </div>
  </RadioGroup>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import {
  RadioGroup,
  RadioGroupDescription,
  RadioGroupLabel,
  RadioGroupOption,
} from "@headlessui/vue";

interface Setting {
  title: string;
  description?: string;
}

export default defineComponent({
  components: {
    RadioGroup,
    RadioGroupDescription,
    RadioGroupLabel,
    RadioGroupOption,
  },
  props: {
    settings: { type: Array as PropType<Setting[]>, required: true },
    modelValue: { type: Object as PropType<Setting> },
  },
  emits: ["update:modelValue"],
  // setup(props) {
  //   const selected = ref(props.settings[0]);
  //
  //   return {
  //     selected,
  //   };
  // },
  computed: {
    selected: {
      get(): Setting | undefined {
        return this.modelValue;
      },
      set(v: Setting) {
        this.$emit("update:modelValue", v);
      },
    },
  },
});
</script>
