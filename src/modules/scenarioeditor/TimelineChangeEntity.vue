<script setup lang="ts">
import { computed } from "vue";
import { MapPinIcon } from "@lucide/vue";
import UnitSymbol from "@/components/UnitSymbol.vue";
import { useActiveScenario } from "@/composables/scenarioUtils";
import type { EntityId } from "@/types/base";
import { isShallowEqual } from "@/utils";
import type { ChangeEntityType } from "./timelineChanges";

const props = withDefaults(
  defineProps<{ entityType: ChangeEntityType; entityId: EntityId; size?: number }>(),
  { size: 16 },
);

const {
  store: { state },
  unitActions,
} = useActiveScenario();

const unit = computed(() =>
  props.entityType === "unit" ? state.unitMap[props.entityId] : undefined,
);
const name = computed(() => {
  if (unit.value) return unit.value.name;
  return state.layerItemMap[props.entityId]?.name || "Unnamed map item";
});
// A light outline keeps dark frames visible on a dark background. The previous options
// are kept while they are equal: the unit's `_state` is replaced on every time step, and
// new options would redraw the symbol each time.
const symbolOptions = computed<Record<string, unknown> | undefined>((previous) => {
  if (!unit.value) return undefined;
  const next = {
    ...unitActions.getCombinedSymbolOptions(unit.value),
    outlineColor: "rgba(255, 255, 255, 0.8)",
    outlineWidth: 8,
  };
  return isShallowEqual(previous, next) ? previous : next;
});
</script>

<template>
  <span class="flex min-w-0 items-center gap-2">
    <span class="flex w-7 flex-none justify-center">
      <UnitSymbol
        v-if="unit"
        :sidc="unit._state?.sidc ?? unit.sidc"
        :options="symbolOptions"
        :size="size"
      />
      <MapPinIcon v-else class="text-muted-foreground size-4" />
    </span>
    <span class="truncate font-medium">{{ name }}</span>
  </span>
</template>
