<script setup lang="ts">
import { ref } from "vue";
import DragHandle from "@/components/DragHandle.vue";
import { useVModel } from "@vueuse/core";

interface Props {
  width: number;
}

const props = defineProps<Props>();
const emit = defineEmits(["resizeend", "update:width"]);

const panelRef = ref();
const initialWidth = ref(props.width);
const panelWidth = useVModel(props, "width", emit);
</script>
<template>
  <aside
    class="relative flex flex-shrink-0 flex-col border-r-2 bg-gray-50"
    ref="panelRef"
    :style="{ width: panelWidth + 'px' }"
  >
    <slot></slot>
    <DragHandle
      :parent-ref="panelRef"
      @resizestart="initialWidth = $event"
      @resizing="panelWidth = initialWidth + $event"
      @resizeend="emit('resizeend')"
    />
  </aside>
</template>
