<template>
  <div>
    <label
      :for="id || computedId"
      class="block text-sm font-medium text-gray-700"
    >
      <slot name="label">{{ label }}</slot>
    </label>
    <div class="mt-1">
      <textarea
        v-model="localValue"
        :id="id || computedId"
        class="
          shadow-sm
          focus:ring-indigo-500 focus:border-indigo-500
          block
          w-full
          sm:text-sm
          border-gray-300
          rounded-md
        "
        v-bind="$attrs"
      />
    </div>
    <p
      v-if="description || $slots.description"
      class="mt-2 text-sm text-gray-500"
    >
      <slot name="description">{{ description }}</slot>
    </p>
  </div>
</template>

<script>
import { computed, defineComponent } from "vue";
import { nanoid } from "nanoid";

export default defineComponent({
  name: "TextAreaGroup",
  props: {
    id: [String],
    label: String,
    description: String,
    modelValue: [String, Number],
  },
  emits: ["update:modelValue"],
  inheritAttrs: false,
  setup(props, { emit }) {
    const computedId = nanoid();
    const localValue = computed({
      get: () => props.modelValue,
      set: (value) => emit("update:modelValue", value),
    });
    return {
      localValue,
      computedId,
    };
  },
});
</script>
