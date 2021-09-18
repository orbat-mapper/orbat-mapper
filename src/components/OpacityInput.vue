<template>
  <div class="flex items-center">
    <input
      v-if="showRange"
      type="range"
      min="0"
      max="1"
      step="0.01"
      v-model.number="opacity"
      class="w-24"
    />
    <button
      class="h-6 text-gray-500 flex items-center"
      title="Opacity"
      @click.stop="toggleRange"
    >
      <OpacityIcon class="transform scale-110" />
      <span class="text-xs ml-1 text-gray-700 w-7 text-right"
        >{{ opacityAsPercent }}%</span
      >
    </button>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { Opacity as OpacityIcon } from "mdue";
import { useToggle, useVModel } from "@vueuse/core";

export default defineComponent({
  name: "OpacityInput",
  components: { OpacityIcon },
  props: { modelValue: { type: Number, default: 1 } },
  setup(props) {
    const opacity = useVModel(props, "modelValue");
    const [showRange, toggleRange] = useToggle(false);
    const opacityAsPercent = computed(() => (opacity.value * 100).toFixed(0));
    return { opacity, opacityAsPercent, showRange, toggleRange };
  },
});
</script>

<style scoped></style>
