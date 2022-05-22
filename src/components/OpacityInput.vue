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
      class="flex h-6 items-center text-gray-500"
      title="Opacity"
      @click.stop="toggleRange()"
    >
      <OpacityIcon class="scale-110 transform" />
      <span class="ml-1 w-7 text-right text-xs text-gray-700"
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
  props: {
    modelValue: { type: Number, default: 1 },
    visible: { type: Boolean, default: false },
  },
  setup(props) {
    const opacity = useVModel(props, "modelValue");
    const [showRange, toggleRange] = useToggle(props.visible);
    const opacityAsPercent = computed(() => (opacity.value * 100).toFixed(0));
    return { opacity, opacityAsPercent, showRange, toggleRange };
  },
});
</script>

<style scoped></style>
