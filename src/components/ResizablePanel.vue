<script setup lang="ts">
import { ref } from "vue";
import DragHandle from "@/components/DragHandle.vue";
import { useVModel } from "@vueuse/core";

interface Props {
  width: number;
  left?: boolean;
}

const props = withDefaults(defineProps<Props>(), { left: false });
const emit = defineEmits(["resizeend", "update:width"]);

const panelRef = ref();
const initialWidth = ref(props.width);
const panelWidth = useVModel(props, "width", emit);
</script>
<template>
  <aside
    class="relative flex shrink-0 flex-col border-r-2 bg-gray-50"
    ref="panelRef"
    :style="{ width: panelWidth + 'px' }"
  >
    <slot></slot>
    <DragHandle
      :parent-ref="panelRef"
      :left="left"
      @resizestart="initialWidth = $event"
      @resizing="panelWidth = props.left ? initialWidth - $event : initialWidth + $event"
      @resizeend="emit('resizeend')"
    />
  </aside>
</template>
