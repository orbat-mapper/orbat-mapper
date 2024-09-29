<template>
  <div class="flex h-7 items-center overflow-clip">
    <div ref="dragItemRef" class="relative flex flex-shrink-0 cursor-move">
      <MilitarySymbol
        v-if="item.sidc"
        :sidc="item.sidc"
        :options="item.symbolOptions ?? {}"
        :size="15"
        class="w-7"
        :class="{ 'opacity-20': isDragged }"
      />
    </div>
    <span
      class="select-none"
      :class="[
        item.symbolOptions?.reinforcedReduced ? 'ml-2' : '',
        item.location ? 'text-red-900 underline' : '',
      ]"
      >{{ item.name }}</span
    >
  </div>
</template>
<script setup lang="ts">
import MilitarySymbol from "@/components/MilitarySymbol.vue";
import type { CleanupFn } from "@atlaskit/pragmatic-drag-and-drop/types";
import { onMounted, onUnmounted, ref } from "vue";
import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { BreadcrumbItemType } from "@/modules/scenarioeditor/types";
import { getUnitDragItem } from "@/types/draggables";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";

const props = defineProps<{ item: BreadcrumbItemType }>();

const {
  store: { state },
  unitActions: { isUnitLocked },
} = injectStrict(activeScenarioKey);

const dragItemRef = ref<HTMLElement | null>(null);
let isDragged = ref(false);

let dndCleanup: CleanupFn = () => {};
onMounted(() => {
  if (!dragItemRef.value || !props.item.id) return;
  const unit = state.getUnitById(props.item.id);
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
