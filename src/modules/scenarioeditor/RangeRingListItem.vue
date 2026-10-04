<script setup lang="ts">
import { IconEye, IconEyeOff } from "@iconify-prerendered/vue-mdi";
import { Button } from "@/components/ui/button";
import RangeRingSwatch from "@/modules/scenarioeditor/RangeRingSwatch.vue";
import type { RangeRingStyle } from "@/types/scenarioGeoModels";
import type { RangeRingEntry } from "@/modules/scenarioeditor/rangeRingLayerEntries";

defineProps<{
  entry: RangeRingEntry;
  /** Hidden by its group, the ungrouped toggle or the range rings toggle. */
  dimmed: boolean;
  styling: Partial<RangeRingStyle>;
}>();
const emit = defineEmits<{ select: []; "toggle-visibility": [] }>();
</script>

<template>
  <li
    class="group hover:bg-accent flex items-center justify-between border-l border-transparent pl-12 select-none"
  >
    <button
      type="button"
      class="flex min-w-0 flex-auto items-center py-2.5 text-left sm:py-2"
      :class="{ 'opacity-50': dimmed || entry.ring.hidden }"
      title="Select unit"
      @click="emit('select')"
    >
      <RangeRingSwatch class="size-4" :styling="styling" />
      <span class="ml-2 truncate text-sm">{{ entry.unitName }}</span>
      <span class="text-muted-foreground ml-2 truncate text-xs">
        {{ entry.ring.name }} · {{ entry.ring.range }} {{ entry.ring.uom }}
      </span>
    </button>
    <Button
      type="button"
      variant="ghost"
      size="icon"
      title="Toggle ring visibility"
      class="opacity-0 group-focus-within:opacity-100 group-hover:opacity-100"
      @click="emit('toggle-visibility')"
    >
      <IconEyeOff v-if="entry.ring.hidden" class="size-5" />
      <IconEye v-else class="size-5" />
    </Button>
  </li>
</template>
