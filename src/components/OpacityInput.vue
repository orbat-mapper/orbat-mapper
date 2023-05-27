<template>
  <div class="flex items-center">
    <input
      v-if="showRange"
      type="range"
      min="0"
      max="1"
      step="0.01"
      v-model.number.lazy="opacity"
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

<script setup lang="ts">
import { computed } from "vue";
import { IconOpacity as OpacityIcon } from "@iconify-prerendered/vue-mdi";
import { useToggle, useVModel } from "@vueuse/core";

interface Props {
  modelValue?: number;
  visible?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 1,
  visible: false,
});

const opacity = useVModel(props, "modelValue");
const [showRange, toggleRange] = useToggle(props.visible);
const opacityAsPercent = computed(() => (opacity.value * 100).toFixed(0));
</script>
