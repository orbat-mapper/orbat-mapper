<script setup lang="ts">
import { ref } from "vue";
import DragHandle from "@/components/DragHandle.vue";

interface Props {
  left?: boolean;
}

const props = withDefaults(defineProps<Props>(), { left: false });
const emit = defineEmits(["resizeend"]);

const panelRef = ref();
const panelWidth = defineModel<number>("width", { required: true });
const initialWidth = ref(panelWidth.value);
</script>
<template>
  <aside
    class="bg-muted/50 relative flex shrink-0 flex-col border-r-2"
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
