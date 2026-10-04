<script setup lang="ts">
import { IconEye, IconEyeOff, IconPalette } from "@iconify-prerendered/vue-mdi";
import { ChevronRight } from "@lucide/vue";
import { Button } from "@/components/ui/button";
import RangeRingSwatch from "@/modules/scenarioeditor/RangeRingSwatch.vue";
import type { RangeRingStyle } from "@/types/scenarioGeoModels";

defineProps<{
  label: string;
  countLabel: string;
  /** Ring style shown as the icon; muted when left out. */
  styling?: Partial<RangeRingStyle>;
  hidden: boolean;
  /** Hidden by the range rings toggle or by its own toggle. */
  dimmed: boolean;
  toggleTitle: string;
  /** Shows a button for editing the style; the event target is the popover anchor. */
  editable?: boolean;
}>();
const open = defineModel<boolean>("open", { default: false });
const emit = defineEmits<{
  "toggle-visibility": [];
  "edit-style": [anchor: HTMLElement];
}>();
</script>

<template>
  <li
    class="group hover:bg-accent flex items-center justify-between border-l border-transparent pl-6 select-none"
  >
    <button
      type="button"
      class="flex min-w-0 flex-auto items-center py-2.5 text-left sm:py-2"
      :class="{ 'opacity-50': dimmed }"
      :aria-expanded="open"
      @click="open = !open"
    >
      <ChevronRight
        class="text-muted-foreground size-4 shrink-0 transition-transform"
        :class="{ 'rotate-90': open }"
      />
      <RangeRingSwatch class="ml-1 size-4" :styling="styling" />
      <span class="ml-2 truncate text-sm">{{ label }}</span>
      <span class="text-muted-foreground ml-2 text-xs whitespace-nowrap">
        {{ countLabel }}
      </span>
    </button>
    <Button
      v-if="editable"
      type="button"
      variant="ghost"
      size="icon"
      title="Change group style"
      class="opacity-0 group-focus-within:opacity-100 group-hover:opacity-100"
      @click="emit('edit-style', $event.currentTarget as HTMLElement)"
    >
      <IconPalette class="size-5" />
    </Button>
    <Button
      type="button"
      variant="ghost"
      size="icon"
      @click="emit('toggle-visibility')"
      class="opacity-0 group-focus-within:opacity-100 group-hover:opacity-100"
      :title="toggleTitle"
    >
      <IconEyeOff v-if="hidden" class="size-5" />
      <IconEye v-else class="size-5" />
    </Button>
  </li>
</template>
