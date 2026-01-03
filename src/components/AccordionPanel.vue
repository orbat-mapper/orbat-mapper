<script setup lang="ts">
import { ref, watch } from "vue";
import { Minus, Plus } from "lucide-vue-next";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const props = defineProps(["label"]);
const emit = defineEmits(["opened", "closed"]);

const open = ref(false);

watch(open, (isOpen) => {
  emit(isOpen ? "opened" : "closed");
});
</script>

<template>
  <Collapsible v-model:open="open" as="div" class="border-border border-b py-6">
    <h3 class="-my-3 flow-root">
      <CollapsibleTrigger
        class="group flex w-full items-center justify-between py-3 text-sm"
      >
        <span class="text-heading font-bold">
          <slot name="label">{{ label }}</slot>
        </span>
        <span class="ml-6 flex items-center">
          <slot name="right"></slot>
          <Plus
            v-if="!open"
            class="group-hover:text-muted-foreground size-4"
            aria-hidden="true"
          />
          <Minus
            v-else
            class="group-hover:text-muted-foreground size-4"
            aria-hidden="true"
          />
        </span>
      </CollapsibleTrigger>
    </h3>
    <slot v-if="!open" name="closedContent" />
    <CollapsibleContent class="space-y-4 pt-6">
      <slot></slot>
    </CollapsibleContent>
  </Collapsible>
</template>
