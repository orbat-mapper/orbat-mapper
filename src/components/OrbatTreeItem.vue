<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import {
  attachInstruction,
  extractInstruction,
  Instruction,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item";
import type { CleanupFn } from "@atlaskit/pragmatic-drag-and-drop/types";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { ChevronRightIcon } from "@heroicons/vue/20/solid";
import { useActiveUnitStore } from "@/stores/dragStore";
import { type UnitAction } from "@/types/constants";
import DotsMenu from "./DotsMenu.vue";
import { useUnitMenu } from "@/composables/scenarioActions";
import { useSettingsStore } from "@/stores/settingsStore";
import { activeParentKey } from "./injects";
import type { NOrbatItemData, NUnit } from "@/types/internalModels";
import MilitarySymbol from "@/components/MilitarySymbol.vue";
import { SymbolOptions } from "milsymbol";
import { injectStrict } from "@/utils";
import { useSelectedItems } from "@/stores/selectedStore";
import { useTimeoutFn } from "@vueuse/core";
import TreeDropIndicator from "@/components/TreeDropIndicator.vue";
import { getUnitDragItem, isUnitDragItem } from "@/types/draggables";

interface Props {
  item: NOrbatItemData;
  symbolOptions?: SymbolOptions;
  level?: number;
  lastInGroup?: boolean;
}

interface Emits {
  (e: "unit-action", unit: NUnit, action: UnitAction): void;
  (e: "unit-click", unit: NUnit, event: MouseEvent): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const activeParentId = injectStrict(activeParentKey);

const combinedOptions = computed(() => ({
  ...(props.symbolOptions || {}),
  ...(props.item.unit.symbolOptions || {}),
}));

let subTree = ref<HTMLElement | null>(null);
const itemRef = ref<HTMLElement | null>(null);
const dragItemRef = ref<HTMLElement | null>(null);

let isDragged = ref(false);
const isDragOver = ref(false);

const unit = computed(() => props.item.unit);
const isOpen = computed({
  get(): boolean {
    return !!props.item.unit._isOpen;
  },
  set(v: boolean) {
    props.item.unit._isOpen = v;
  },
});

const {
  isPending,
  start: startOpenTimeout,
  stop: stopOpenTimeout,
} = useTimeoutFn(
  () => {
    isOpen.value = true;
  },
  500,
  { immediate: false },
);

const settingsStore = useSettingsStore();
const { selectedUnitIds, activeUnitId } = useSelectedItems();

const unitLabel = computed(() =>
  settingsStore.orbatShortName
    ? unit.value.shortName || unit.value.name
    : unit.value.name,
);

const activeUnitStore = useActiveUnitStore();

const isActiveUnit = computed(() => activeUnitId.value === props.item.unit.id);
const isActiveParent = computed(() => activeParentId.value === props.item.unit.id);

const hasActiveChildren = computed(() =>
  activeUnitStore.activeUnitParentIds.value.includes(props.item.unit.id),
);

const { unitMenuItems: menuItems } = useUnitMenu(props.item);

let dndCleanup: CleanupFn = () => {};
const instruction = ref<Instruction | null>(null);

onMounted(() => {
  if (!itemRef.value || !dragItemRef.value) return;
  dndCleanup = combine(
    draggable({
      element: dragItemRef.value,
      getInitialData: () => getUnitDragItem({ unit: props.item.unit }),
      onDragStart: () => (isDragged.value = true),
      onDrop: () => (isDragged.value = false),
    }),

    dropTargetForElements({
      element: itemRef.value,
      getData: ({ input, element }) => {
        const data = getUnitDragItem({ unit: props.item.unit });
        return attachInstruction(data, {
          input,
          element,
          currentLevel: props.level ?? 0,
          indentPerLevel: 20,
          block: ["reparent"],
          mode:
            isParent.value && isOpen.value
              ? "expanded"
              : props.lastInGroup
                ? "last-in-group"
                : "standard",
        });
      },
      canDrop: ({ source }) => {
        return (
          isUnitDragItem(source.data) &&
          source.data.unit.id !== props.item.unit.id &&
          props.item.unit._pid !== source.data.unit.id
        );
      },
      onDragEnter: ({ self }) => {
        isDragOver.value = true;
      },
      onDrag: (args) => {
        instruction.value = extractInstruction(args.self.data);
        if (
          instruction.value?.type === "make-child" &&
          isParent.value &&
          !isOpen.value &&
          !isPending.value
        ) {
          startOpenTimeout();
        }

        if (instruction.value?.type !== "make-child" && isPending.value) {
          stopOpenTimeout();
        }
      },
      onDragLeave: () => {
        isDragOver.value = false;
        instruction.value = null;
        stopOpenTimeout();
      },
      onDrop: (args) => {
        isDragOver.value = false;
        instruction.value = null;
        stopOpenTimeout();
      },
    }),
  );
});

onUnmounted(() => {
  dndCleanup();
});

const isParent = computed(() =>
  Boolean(props.item.children && props.item.children.length),
);

const onUnitMenuAction = (unit: NUnit, action: UnitAction) => {
  emit("unit-action", unit, action);
};

const onUnitClick = (unit: NUnit, event: MouseEvent) => {
  emit("unit-click", unit, event);
};
</script>

<template>
  <li :id="'ou-' + unit.id" class="relative text-gray-900 dark:text-gray-400">
    <div
      ref="itemRef"
      class="group relative flex items-center justify-between border-l-2 py-2 pl-2 hover:bg-gray-200 dark:hover:bg-gray-700 sm:pl-0"
      @dblclick="isOpen = !isOpen"
      @click="onUnitClick(unit, $event)"
      :class="[
        selectedUnitIds.has(unit.id) && selectedUnitIds.size > 1
          ? 'bg-yellow-100 hover:bg-yellow-200'
          : '',
        isActiveParent ? 'border-red-800 bg-red-50' : 'border-transparent',
      ]"
    >
      <div class="flex items-center space-x-1">
        <div class="h-6 w-6">
          <button v-if="isParent" @click.stop="isOpen = !isOpen" class="">
            <ChevronRightIcon
              class="h-6 w-6 transform text-gray-500 transition-transform group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-gray-100"
              :class="{
                'rotate-90': isOpen,
                'text-red-600': hasActiveChildren,
              }"
            />
          </button>
        </div>
        <button class="flex items-center space-x-1">
          <div class="flex items-center space-x-1" :class="{ 'opacity-20': isDragged }">
            <div
              class="flex flex-shrink-0 cursor-move justify-center"
              :style="{ width: settingsStore.orbatIconSize + 'pt' }"
              ref="dragItemRef"
            >
              <MilitarySymbol
                :sidc="unit._state?.sidc || unit.sidc"
                :size="settingsStore.orbatIconSize"
                :options="combinedOptions"
                @click.stop.prevent=""
              />
            </div>
            <span
              class="flex-auto pl-1.5 text-left text-gray-900 dark:text-gray-300"
              :class="{
                'font-bold dark:text-amber-600': isActiveUnit,
              }"
              >{{ unitLabel }}</span
            ><span v-if="unit._state?.location" class="text-red-700">&deg;</span>
          </div>
        </button>
      </div>

      <DotsMenu
        class="flex-shrink-0 pr-2 opacity-0 group-focus-within:opacity-100 group-hover:opacity-100"
        :items="menuItems"
        @action="onUnitMenuAction(unit, $event)"
      />
      <TreeDropIndicator v-if="instruction" :instruction="instruction" />
    </div>
    <ul v-if="isOpen" class="ml-6 pb-1" ref="subTree">
      <OrbatTreeItem
        :item="subUnit"
        :level="props.level ? props.level + 1 : 1"
        v-for="(subUnit, index) in item.children"
        :key="subUnit.unit.id"
        @unit-action="onUnitMenuAction"
        @unit-click="onUnitClick"
        :symbolOptions="symbolOptions"
        :last-in-group="index === item.children.length - 1"
      />
    </ul>
  </li>
</template>
