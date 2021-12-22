<template>
  <InputGroupTemplate
    :label="label"
    :description="description"
    v-slot="{ id }"
    :class="extraClass"
  >
    <select
      v-model="selectedValue"
      :id="id"
      class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
    >
      <option v-for="val in computedValues" :value="val.value" :key="val.value">
        {{ val.label }}
      </option>
    </select>
  </InputGroupTemplate>
</template>

<script lang="ts">
import InputGroupTemplate from "./InputGroupTemplate.vue";
import { useVModel } from "@vueuse/core";
import { computed, defineComponent, PropType } from "vue";

interface SelectItem {
  label: string;
  value: string | number;
}

export default defineComponent({
  name: "SimpleSelect",
  components: { InputGroupTemplate },
  props: {
    label: String,
    description: String,
    modelValue: [String, Number],
    items: { type: Array as PropType<SelectItem[]> },
    values: { type: Array as PropType<(string | number)[]> },
    extraClass: [String, Array, Object, Function, Boolean],
  },
  emits: ["update:modelValue"],
  inheritAttrs: false,

  setup(props, { emit }) {
    const selectedValue = useVModel(props, "modelValue", emit);
    const computedValues = computed(() => {
      if (props.items) return props.items;

      return (props.values || []).map((i) => ({
        label: i,
        value: i,
      }));
    });
    return { selectedValue, computedValues };
  },
});
</script>
