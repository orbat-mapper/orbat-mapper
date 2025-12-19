<script setup lang="ts">
import type { DialogRootEmits, DialogRootProps } from "reka-ui";
import { useForwardPropsEmits } from "reka-ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";

const props = withDefaults(
  defineProps<
    DialogRootProps & {
      title?: string;
      description?: string;
    }
  >(),
  {
    title: "Command Palette",
    description: "Search for a command to run...",
  },
);
const emits = defineEmits<DialogRootEmits>();

const forwarded = useForwardPropsEmits(props, emits);
</script>

<template>
  <Dialog v-slot="slotProps" v-bind="forwarded">
    <DialogContent class="top-14 translate-y-0 overflow-hidden p-0 sm:max-w-xl">
      <DialogHeader class="sr-only">
        <DialogTitle>{{ title }}</DialogTitle>
        <DialogDescription>{{ description }}</DialogDescription>
      </DialogHeader>
      <slot v-bind="slotProps" />
    </DialogContent>
  </Dialog>
</template>
