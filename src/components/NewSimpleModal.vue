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
import { cn } from "@/lib/utils.ts";

interface SimpleModalProps {
  dialogTitle?: string;
  description?: string;
  class?: HTMLAttributes["class"];
  fixedHeight?: boolean;
}

const props = defineProps<SimpleModalProps>();
const open = defineModel<boolean>({ default: false });
const emit = defineEmits(["update:modelValue", "cancel"]);

import DialogContent from "./ui/dialog/DialogContent.vue";

const uiStore = useUiStore();
onMounted(() => (uiStore.modalOpen = open.value));
watch(open, async (v) => {
  uiStore.modalOpen = v;
});

onUnmounted(() => (uiStore.modalOpen = false));
</script>
<template>
  <Dialog v-model:open="open" @update:open="emit('cancel')">
    <component
      :is="fixedHeight ? DialogContent : DialogScrollContent"
      :class="cn('min-h-0 max-w-[calc(100%-1rem)] rounded sm:max-w-lg', props.class)"
    >
      <DialogHeader v-if="dialogTitle || $slots.description">
        <DialogTitle>{{ dialogTitle }}</DialogTitle>
        <DialogDescription v-if="dialogTitle || $slots.description">
          <slot name="description"> {{ description }}</slot>
        </DialogDescription>
      </DialogHeader>
      <slot />
    </component>
  </Dialog>
</template>
