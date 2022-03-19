<template>
  <div>
    <label :for="id || computedId" class="block text-sm font-medium text-gray-700">
      <slot name="label">{{ label }}</slot>
    </label>
    <div class="mt-1 flex items-center">
      <input
        type="number"
        v-model.number="localValue"
        :id="id || computedId"
        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        v-bind="$attrs"
      />
      <BaseToolbar class="ml-2">
        <ToolbarButton @click="decrement()" start>
          <span class="sr-only">Decrease</span>
          <MinusIcon class="h-5 w-5" aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton @click="increment()" end>
          <span class="sr-only">Increase</span>
          <PlusIcon class="h-5 w-5" aria-hidden="true" />
        </ToolbarButton>
      </BaseToolbar>
    </div>
    <p v-if="description || $slots.description" class="mt-2 text-sm text-gray-500">
      <slot name="description">{{ description }}</slot>
    </p>
  </div>
</template>

<script>
import { computed, defineComponent } from "vue";
import { nanoid } from "nanoid";
import { MinusIcon, PlusIcon } from "@heroicons/vue/solid";
import BaseToolbar from "./BaseToolbar.vue";
import ToolbarButton from "./ToolbarButton.vue";

export default defineComponent({
  name: "NumberInputGroup",
  props: {
    id: [String],
    label: String,
    description: String,
    modelValue: [Number],
    min: Number,
    max: Number,
    step: { type: Number, default: 1 },
  },
  emits: ["update:modelValue"],
  inheritAttrs: false,
  components: { ToolbarButton, BaseToolbar, PlusIcon, MinusIcon },
  setup(props, { emit }) {
    const computedId = nanoid();
    const localValue = computed({
      get: () => props.modelValue,
      set: (value) => emit("update:modelValue", value),
    });

    function increment() {
      localValue.value;
      if (props.max != null) {
        localValue.value = Math.min(props.max, localValue.value + props.step);
      } else {
        localValue.value += props.step;
      }
    }

    function decrement() {
      localValue.value;
      if (props.min != null) {
        localValue.value = Math.max(props.min, localValue.value - props.step);
      } else {
        localValue.value -= props.step;
      }
    }

    return {
      localValue,
      computedId,
      increment,
      decrement,
    };
  },
});
</script>
