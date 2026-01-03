<script setup lang="ts">
import MilitarySymbol from "@/components/NewMilitarySymbol.vue";
import type { CleanupFn } from "@atlaskit/pragmatic-drag-and-drop/types";
import { onMounted, onUnmounted, ref } from "vue";
import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { type BreadcrumbItemType } from "@/modules/scenarioeditor/types";
import { getUnitDragItem } from "@/types/draggables";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import UnitSymbol from "@/components/UnitSymbol.vue";

const props = defineProps<{ item: BreadcrumbItemType }>();

const {
  store: { state },
  unitActions: { isUnitLocked },
  helpers: { getUnitById },
} = injectStrict(activeScenarioKey);

const dragItemRef = ref<HTMLElement | null>(null);
let isDragged = ref(false);

let dndCleanup: CleanupFn = () => {};
onMounted(() => {
  if (!dragItemRef.value || !props.item.id) return;
  const unit = getUnitById(props.item.id);
  if (!unit) {
    return;
  }
  dndCleanup = draggable({
    element: dragItemRef.value,
    canDrag: () => !isUnitLocked(unit.id),
    getInitialData: () => getUnitDragItem({ unit }, "breadcrumbs"),
    onDragStart: () => (isDragged.value = true),
    onDrop: () => (isDragged.value = false),
  });
});

onUnmounted(() => {
  dndCleanup();
});
</script>

<template>
  <div class="flex h-7 items-center overflow-clip">
    <div ref="dragItemRef" class="relative flex shrink-0 cursor-move">
      <UnitSymbol
        v-if="item.sidc"
        :sidc="item.sidc"
        :options="item.symbolOptions ?? {}"
        :modifiers="{ outlineWidth: 8 }"
        :size="15"
        class="w-7"
        :class="{ 'opacity-20': isDragged }"
      />
    </div>
    <span
      class="ml-1 select-none"
      :class="[
        item.symbolOptions?.reinforcedReduced ? 'ml-2' : '',
        item.location ? 'text-accent-foreground underline' : '',
      ]"
      >{{ item.name }}</span
    >
  </div>
</template>
