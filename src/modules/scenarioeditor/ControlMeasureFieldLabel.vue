<script setup lang="ts">
import { Info } from "@lucide/vue";
import { FieldLabel } from "@/components/ui/field";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

/**
 * A field's label, with its description behind an info button rather than under
 * the label, so long descriptions do not push the panel's controls apart. The
 * default slot adds to the label text (a unit suffix).
 */
defineProps<{
  for: string;
  label: string;
  description?: string;
}>();
</script>

<template>
  <div class="flex min-w-0 items-center gap-1">
    <FieldLabel :for="$props.for">{{ label }}<slot /></FieldLabel>
    <Popover v-if="description">
      <PopoverTrigger
        type="button"
        data-test="field-hint"
        class="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 inline-flex size-5 shrink-0 items-center justify-center rounded-sm outline-none focus-visible:ring-[3px]"
        :aria-label="`About ${label}`"
      >
        <Info class="size-3.5" />
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        class="w-64 p-3 text-xs leading-relaxed"
        data-test="field-hint-content"
      >
        {{ description }}
      </PopoverContent>
    </Popover>
  </div>
</template>
