<script setup lang="ts">
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

type SlideOverProps = {
  title?: string;
  left?: boolean;
};

defineProps<SlideOverProps>();
const isOpen = defineModel<boolean>();
console.log("hello");
</script>
<template>
  <Sheet v-model:open="isOpen" :side="left ? 'left' : 'right'">
    <SheetContent :side="left ? 'left' : 'right'" class="overflow-y-auto pb-6">
      <SheetHeader class="">
        <SheetTitle>
          <slot name="title">{{ title }}</slot>
        </SheetTitle>
      </SheetHeader>
      <div class="px-4">
        <slot />
      </div>
    </SheetContent>
  </Sheet>
</template>
