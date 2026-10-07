<script setup lang="ts">
import LayerItemActions from "@/modules/scenarioeditor/LayerItemActions.vue";
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
    class="group hover:bg-accent focus-within:bg-accent relative flex items-center justify-between border-l border-transparent pl-13 select-none"
  >
    <button
      type="button"
      class="flex min-w-0 flex-auto items-center py-1.5 text-left"
      :class="{ 'opacity-50': dimmed || entry.ring.hidden }"
      title="Select unit"
      @click="emit('select')"
    >
      <RangeRingSwatch class="size-5 shrink-0" :styling="styling" />
      <span class="ml-2 truncate text-sm">{{ entry.unitName }}</span>
      <span class="text-muted-foreground ml-2 shrink-[3] truncate text-xs">
        {{ entry.ring.name }} · {{ entry.ring.range }} {{ entry.ring.uom }}
      </span>
    </button>
    <LayerItemActions
      :hidden="entry.ring.hidden"
      toggle-title="Toggle ring visibility"
      @toggle-visibility="emit('toggle-visibility')"
    />
  </li>
</template>
