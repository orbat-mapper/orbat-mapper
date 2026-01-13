<script setup lang="ts">
import { ref, watch } from "vue";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUiStore } from "@/stores/uiStore";
import { cn } from "@/lib/utils";

interface Props {
  dialogTitle?: string;
  initialFocus?: HTMLElement;
  maxWidth?: string;
}

const props = withDefaults(defineProps<Props>(), {
  maxWidth: "sm:max-w-xl",
});

const open = defineModel<boolean>({ default: false });
const emit = defineEmits(["cancel"]);
const uiStore = useUiStore();

watch(
  open,
  (v) => {
    uiStore.modalOpen = v;
    if (!v) emit("cancel");
  },
  { immediate: true },
);
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent
      :class="cn('max-w-[calc(100%-1rem)] rounded', props.maxWidth)"
      @close="open = false"
    >
      <DialogHeader v-if="dialogTitle || $slots.title">
        <DialogTitle>
          <slot name="title">{{ dialogTitle }}</slot>
        </DialogTitle>
      </DialogHeader>
      <slot></slot>
    </DialogContent>
  </Dialog>
</template>
