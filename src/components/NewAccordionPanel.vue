<script setup lang="ts">
import { MinusIcon, PlusIcon } from "lucide-vue-next";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const props = defineProps<{ label: string }>();
const isOpen = defineModel<boolean>({ default: true });
</script>

<template>
  <Collapsible v-model="isOpen" class="border-border border-b">
    <CollapsibleTrigger class="group flex w-full items-center justify-between py-3">
      <h3 class="flex items-center gap-2 text-sm font-semibold">
        {{ label }}
      </h3>
      <PlusIcon
        class="text-muted-foreground hidden h-4 w-4 group-data-[state=closed]:block"
      />
      <MinusIcon
        class="text-muted-foreground hidden h-4 w-4 group-data-[state=open]:block"
      />
    </CollapsibleTrigger>
    <CollapsibleContent className="pt-1 pb-3"><slot /></CollapsibleContent>
  </Collapsible>
</template>
