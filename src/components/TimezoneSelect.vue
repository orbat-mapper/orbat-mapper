<template>
  <SimpleSelect :values="timeZonesNames" v-model="tzValue" />
</template>

<script>
import { timeZonesNames } from "@vvo/tzdb";
import { useVModel } from "@vueuse/core";
import SimpleSelect from "./SimpleSelect.vue";

export default {
  name: "TimezoneSelect",
  components: { SimpleSelect },
  emits: ["update:modelValue"],
  props: { modelValue: String },
  setup(props) {
    const tzValue = useVModel(props, "modelValue");
    return {
      timeZonesNames,
      tzValue,
    };
  },
};
</script>
