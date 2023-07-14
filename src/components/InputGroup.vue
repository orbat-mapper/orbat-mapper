<template>
  <div>
    <label :for="id || computedId" class="block text-sm font-medium text-gray-700">
      <slot name="label">{{ label }}</slot>
    </label>
    <div class="mt-1">
      <input
        type="text"
        v-model="localValue"
        :id="id || computedId"
        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        v-bind="$attrs"
      />
    </div>
    <p v-if="description || $slots.description" class="mt-2 text-sm text-gray-500">
      <slot name="description">{{ description }}</slot>
    </p>
  </div>
</template>

<script>
import { computed, defineComponent } from "vue";
import { nanoid } from "nanoid";

export default defineComponent({
  name: "InputGroup",
  props: {
    id: [String],
    label: String,
    description: String,
    modelValue: [String, Number],
    autofocus: Boolean,
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
  mounted() {
    if (this.autofocus) {
      this.$el.querySelector("input").focus();
    }
  },
});
</script>
