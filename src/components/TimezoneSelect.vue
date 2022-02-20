<template>
  <SimpleCombo :values="timeZonesNames" v-model="tzValue" />
</template>

<script>
import { timeZonesNames } from "@vvo/tzdb";
import { useVModel } from "@vueuse/core";
import SimpleSelect from "./SimpleSelect.vue";
import SimpleCombo from "./SimpleCombo.vue";

export default {
  name: "TimezoneSelect",
  components: { SimpleCombo, SimpleSelect },
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
