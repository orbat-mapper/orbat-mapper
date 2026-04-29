<script setup lang="ts">
import { ChevronRightIcon, ChevronUpIcon } from "@heroicons/vue/20/solid";
import UnitSymbol from "@/components/UnitSymbol.vue";
import type { EntityId } from "@/types/base";
import type { NUnit } from "@/types/internalModels";
import type { UnitSymbolOptions } from "@/types/scenarioModels";

export interface UnitTreeUnitRow {
  type: "unit";
  unitId: EntityId;
  level: number;
  unit: NUnit;
  symbolOptions: UnitSymbolOptions;
  hasChildren: boolean;
}

export interface UnitTreeHeaderRow {
  type: "side" | "group";
  id: EntityId;
  label: string;
  level: number;
}

export type UnitTreeVisibleRow = UnitTreeUnitRow | UnitTreeHeaderRow;

defineProps<{
  row: UnitTreeVisibleRow;
  selected: boolean;
  isOpen: boolean;
  virtualized?: boolean;
}>();

const emit = defineEmits<{
  select: [unitId: EntityId];
  toggle: [];
}>();

function indentStyle(level: number) {
  return { paddingLeft: `${0.5 + level}rem` };
}
</script>

<template>
  <div
    v-if="row.type !== 'unit'"
    :class="virtualized ? 'flex h-full items-end' : 'pt-2'"
    :style="indentStyle(row.level)"
  >
    <button
      type="button"
      class="text-muted-foreground hover:text-foreground flex w-full items-center justify-between rounded px-2 pb-1 text-left text-[11px] leading-none font-semibold tracking-wide uppercase"
      @click="emit('toggle')"
    >
      <span class="truncate">{{ row.label }}</span>
      <ChevronUpIcon
        class="size-4 shrink-0 transition-transform"
        :class="isOpen ? 'rotate-180' : ''"
      />
    </button>
  </div>
  <button
    v-else
    type="button"
    class="hover:bg-accent flex min-h-8 w-full items-center gap-1 rounded px-2 py-1.5 text-left text-sm"
    :class="[virtualized ? 'h-full' : '', selected ? 'bg-accent font-semibold' : '']"
    :style="indentStyle(row.level)"
    @click="emit('select', row.unitId)"
  >
    <span class="size-4 shrink-0">
      <ChevronRightIcon
        v-if="row.hasChildren"
        class="text-muted-foreground hover:text-foreground size-4 transition-transform"
        :class="isOpen ? 'rotate-90' : ''"
        @click.stop="emit('toggle')"
      />
    </span>
    <UnitSymbol
      class="size-6 shrink-0"
      :sidc="row.unit.sidc"
      :size="18"
      :options="row.symbolOptions"
    />
    <span class="truncate">{{ row.unit.name }}</span>
  </button>
</template>
