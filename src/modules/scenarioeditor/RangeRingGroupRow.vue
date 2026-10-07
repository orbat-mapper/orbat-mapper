<script setup lang="ts">
import { IconPalette } from "@iconify-prerendered/vue-mdi";
import { ChevronRight } from "@lucide/vue";
import LayerItemActions from "@/modules/scenarioeditor/LayerItemActions.vue";
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
    class="group hover:bg-accent focus-within:bg-accent relative flex items-center justify-between border-l border-transparent select-none"
  >
    <button
      type="button"
      class="flex min-w-0 flex-auto items-center py-1.5 text-left"
      :class="{ 'opacity-50': dimmed }"
      :aria-expanded="open"
      @click="open = !open"
    >
      <ChevronRight
        class="text-muted-foreground mx-1 size-4 shrink-0 transition-transform"
        :class="{ 'rotate-90': open }"
      />
      <RangeRingSwatch class="size-5 shrink-0" :styling="styling" />
      <span class="ml-2 truncate text-sm">{{ label }}</span>
      <span class="text-muted-foreground ml-2 text-xs whitespace-nowrap">
        {{ countLabel }}
      </span>
    </button>
    <LayerItemActions
      :hidden="hidden"
      :toggle-title="toggleTitle"
      @toggle-visibility="emit('toggle-visibility')"
    >
      <button
        v-if="editable"
        type="button"
        title="Change group style"
        class="text-muted-foreground hover:text-foreground flex size-7 items-center justify-center rounded-md"
        @click="emit('edit-style', $event.currentTarget as HTMLElement)"
      >
        <IconPalette class="size-4" />
      </button>
    </LayerItemActions>
  </li>
</template>
