<template>
  <div class="relative flex items-start">
    <div class="flex h-5 items-center">
      <input
        type="checkbox"
        v-model="localValue"
        :id="_id"
        class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        v-bind="$attrs"
      />
    </div>
    <div class="ml-3 text-sm">
      <label :for="_id" class="font-medium text-gray-700">
        <slot name="label">{{ label }}</slot>
      </label>
      <p v-if="description || $slots.description" class="text-gray-500">
        <slot name="description">{{ description }}</slot>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { nanoid } from "nanoid";

interface Props {
  id?: string;
  label?: string;
  description?: string;
  modelValue?: boolean | any[];
}
const props = withDefaults(defineProps<Props>(), {});
const emit = defineEmits(["update:modelValue"]);

const _id = props.id || nanoid(5);

const localValue = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
};
</script>
