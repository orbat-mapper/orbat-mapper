<script setup lang="ts">
import { type HTMLAttributes, onMounted, onUnmounted, watch } from "vue";

import { useUiStore } from "@/stores/uiStore";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogScrollContent,
  DialogTitle,
} from "@/components/ui/dialog";

interface SimpleModalProps {
  dialogTitle?: string;
  description?: string;
  class?: HTMLAttributes["class"];
}

const props = defineProps<SimpleModalProps>();
const open = defineModel<boolean>({ default: false });
const emit = defineEmits(["update:modelValue", "cancel"]);

const uiStore = useUiStore();
onMounted(() => (uiStore.modalOpen = open.value));
watch(open, async (v) => {
  uiStore.modalOpen = v;
});

onUnmounted(() => (uiStore.modalOpen = false));
</script>
<template>
  <Dialog v-model:open="open" @update:open="emit('cancel')">
    <DialogScrollContent :class="props.class">
      <DialogHeader>
        <DialogTitle>{{ dialogTitle }}</DialogTitle>
        <DialogDescription v-if="dialogTitle || $slots.description">
          <slot name="description"> {{ description }}</slot>
        </DialogDescription>
      </DialogHeader>
      <slot />
    </DialogScrollContent>
  </Dialog>
</template>
