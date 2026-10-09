<script setup lang="ts">
import { computed, ref } from "vue";
import { isEqual } from "es-toolkit";
import {
  IconClose,
  IconEyeOff,
  IconLockOutline,
  IconMapMarkerOffOutline,
} from "@iconify-prerendered/vue-mdi";
import type { NUnit } from "@/types/internalModels";
import type { EntityId } from "@/types/base";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { useSelectedItems } from "@/stores/selectedStore";
import UnitSymbol from "@/components/UnitSymbol.vue";
import IconButton from "@/components/IconButton.vue";

// Roughly two rows of symbols in a default-width panel
const MAX_STRIP_UNITS = 16;

const props = defineProps<{ units: NUnit[] }>();

const {
  unitActions: { getCombinedSymbolOptions, isUnitLocked },
} = injectStrict(activeScenarioKey);
const { selectedUnitIds, activeUnitId } = useSelectedItems();

const showList = ref(false);

const stripUnits = computed(() => props.units.slice(0, MAX_STRIP_UNITS));
const hiddenCount = computed(() => props.units.length - stripUnits.value.length);

// Hand back the previous options object when nothing changed, so the symbols
// aren't regenerated each time the scenario time moves.
const optionsCache = new Map<EntityId, ReturnType<typeof getCombinedSymbolOptions>>();
function symbolOptions(unit: NUnit) {
  const next = { ...getCombinedSymbolOptions(unit), outlineWidth: 8 };
  const prev = optionsCache.get(unit.id);
  if (prev && isEqual(prev, next)) return prev;
  optionsCache.set(unit.id, next);
  return next;
}

function selectOnly(unitId: EntityId) {
  activeUnitId.value = unitId;
}

function deselect(unitId: EntityId) {
  selectedUnitIds.value.delete(unitId);
}
</script>

<template>
  <div class="mt-2 pb-2">
    <ul v-if="!showList" class="flex flex-wrap items-center gap-1">
      <li v-for="unit in stripUnits" :key="unit.id">
        <button
          type="button"
          class="hover:bg-accent flex rounded-sm p-0.5"
          :title="`${unit.name}. Click to select only this unit.`"
          @click="selectOnly(unit.id)"
        >
          <UnitSymbol
            :sidc="unit._state?.sidc || unit.sidc"
            :size="20"
            class="block w-8"
            :options="symbolOptions(unit)"
          />
        </button>
      </li>
      <li v-if="hiddenCount > 0">
        <button
          type="button"
          class="bg-muted text-muted-foreground hover:text-foreground rounded-full px-2.5 py-1 text-xs font-medium"
          title="Show all selected units"
          @click="showList = true"
        >
          +{{ hiddenCount }}
        </button>
      </li>
    </ul>
    <ul
      v-else
      class="divide-border border-border max-h-64 divide-y overflow-y-auto rounded-md border"
    >
      <li v-for="unit in units" :key="unit.id" class="flex items-center gap-1 pr-1 pl-2">
        <button
          type="button"
          class="flex min-w-0 flex-1 items-center gap-2 py-1 text-left text-sm hover:underline"
          title="Select only this unit"
          @click="selectOnly(unit.id)"
        >
          <UnitSymbol
            :sidc="unit._state?.sidc || unit.sidc"
            :size="16"
            class="block w-7 shrink-0"
            :options="symbolOptions(unit)"
          />
          <span class="truncate">{{ unit.name }}</span>
        </button>
        <span class="text-muted-foreground flex shrink-0 items-center gap-1">
          <IconLockOutline v-if="isUnitLocked(unit.id)" class="size-4" title="Locked" />
          <IconEyeOff v-if="unit.isHidden" class="size-4" title="Hidden on map" />
          <IconMapMarkerOffOutline
            v-if="!unit._state?.location"
            class="size-4"
            title="Not on the map at the current time"
          />
        </span>
        <IconButton title="Remove from selection" @click="deselect(unit.id)">
          <IconClose class="size-4" aria-hidden="true" />
        </IconButton>
      </li>
    </ul>
    <button
      type="button"
      class="text-muted-foreground hover:text-foreground mt-1 text-xs"
      @click="showList = !showList"
    >
      {{ showList ? "Show as symbols" : "Show as list" }}
    </button>
  </div>
</template>
