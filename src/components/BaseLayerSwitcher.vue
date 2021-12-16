<template>
  <RadioGroup v-model="selected">
    <RadioGroupLabel class="sr-only"> Privacy setting</RadioGroupLabel>
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
            settingIdx === settings.length - 1 ? 'rounded-bl-md rounded-br-md' : '',
            checked ? 'bg-indigo-50 border-indigo-200 z-10' : 'border-gray-200',
            'relative border p-4 flex cursor-pointer focus:outline-none',
          ]"
        >
          <span
            class="flex-shrink-0"
            :class="[
              checked ? 'bg-indigo-600 border-transparent' : 'bg-white border-gray-300',
              active ? 'ring-2 ring-offset-2 ring-indigo-500' : '',
              'h-4 w-4 mt-0.5 cursor-pointer rounded-full border flex items-center justify-center',
            ]"
            aria-hidden="true"
          >
            <span class="rounded-full bg-white w-1.5 h-1.5" />
          </span>
          <div class="ml-3 flex flex-auto min-w-0 flex-col">
            <RadioGroupLabel
              as="div"
              :class="[
                checked ? 'text-indigo-900' : 'text-gray-900',
                'text-sm font-medium flex items-center justify-between',
              ]"
            >
              <span class="truncate flex-auto">{{ setting.title }}</span>
              <OpacityInput
                :model-value="setting.opacity"
                @update:model-value="$emit('update:layerOpacity', setting, $event)"
                class="flex-shrink-0"
              />
            </RadioGroupLabel>
            <RadioGroupDescription
              as="span"
              :class="[checked ? 'text-indigo-700' : 'text-gray-500', 'block text-sm']"
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
import { Opacity as OpacityIcon } from "mdue";
import { LayerInfo } from "./LayersPanel.vue";
import OpacityInput from "./OpacityInput.vue";

export default defineComponent({
  components: {
    OpacityInput,
    RadioGroup,
    RadioGroupDescription,
    RadioGroupLabel,
    RadioGroupOption,
    OpacityIcon,
  },
  props: {
    settings: { type: Array as PropType<LayerInfo<any>[]>, required: true },
    modelValue: { type: Object as PropType<LayerInfo<any>> },
  },
  emits: ["update:modelValue", "update:layerOpacity"],
  // setup(props) {
  //   const selected = ref(props.settings[0]);
  //
  //   return {
  //     selected,
  //   };
  // },
  computed: {
    selected: {
      get(): LayerInfo | undefined {
        return this.modelValue;
      },
      set(v: LayerInfo) {
        this.$emit("update:modelValue", v);
      },
    },
  },
});
</script>
