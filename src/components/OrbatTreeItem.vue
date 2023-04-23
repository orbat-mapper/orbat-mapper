<template>
  <li :id="'o-' + unit.id" class="relative text-gray-900 dark:text-gray-400">
    <div
      class="absolute left-8 right-0 top-0 z-10 h-3"
      :class="{ 'border-t-4 border-gray-500': isDragOverAbove }"
      @dragover.prevent="isDragOverAbove = true"
      @drop.prevent="onDrop"
      @dragleave="isDragOverAbove = false"
    />
    <div
      class="group relative flex items-center justify-between border-l-2 py-2 pl-2 hover:bg-gray-200 dark:hover:bg-gray-700"
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
          <button
            v-if="isParent"
            @click.stop="isOpen = !isOpen"
            class=""
            @dragenter.prevent="isOpen = true"
          >
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
              draggable="true"
              @dragstart="dragStart"
              @dragend="dragEnd"
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
                'font-bold underline': isDragOver,
              }"
              @dragover.prevent="isDragOver = true"
              @drop.prevent="onDrop"
              @dragleave="isDragOver = false"
              >{{ unitLabel }}</span
            ><span v-if="unit._state?.location" class="text-red-700">&deg;</span>
          </div>
        </button>
      </div>

      <DotsMenu
        class="flex-shrink-0 pr-2"
        :items="menuItems"
        @action="onUnitMenuAction(unit, $event)"
      />
    </div>
    <ul v-if="isOpen" class="ml-6 pb-1" ref="subTree">
      <OrbatTreeItem
        :item="subUnit"
        v-for="subUnit in item.children"
        :key="subUnit.unit.id"
        @unit-action="onUnitMenuAction"
        @unit-click="onUnitClick"
        @unit-drop="onUnitDrop"
        :symbolOptions="symbolOptions"
      />
    </ul>
    <div
      class="absolute bottom-0 left-8 right-0 h-3"
      :class="{ 'border-b-4 border-gray-500': isDragOverBelow }"
      @dragover.prevent="isDragOverBelow = true"
      @drop.prevent="onDrop"
      @dragleave="isDragOverBelow = false"
    />
  </li>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { Unit } from "@/types/scenarioModels";
import { ChevronRightIcon } from "@heroicons/vue/20/solid";
import { useActiveUnitStore, useDragStore, useSelectedUnits } from "@/stores/dragStore";
import { DragOperations, type UnitAction } from "@/types/constants";
import DotsMenu from "./DotsMenu.vue";
import { useUnitMenu } from "@/composables/scenarioActions";
import { useSettingsStore } from "@/stores/settingsStore";
import { activeParentKey, activeUnitKey } from "./injects";
import type { DropTarget } from "./types";
import type { NOrbatItemData, NUnit } from "@/types/internalModels";
import MilitarySymbol from "@/components/MilitarySymbol.vue";
import { SymbolOptions } from "milsymbol";
import { injectStrict } from "@/utils";

interface Props {
  item: NOrbatItemData;
  symbolOptions?: SymbolOptions;
}

const props = defineProps<Props>();

const combinedOptions = computed(() => ({
  ...(props.symbolOptions || {}),
  ...(props.item.unit.symbolOptions || {}),
}));

// for some reason this throws a vue-tsc error
interface Emits {
  (e: "unit-action", unit: NUnit, action: UnitAction): void;
  (e: "unit-click", unit: NUnit, event: MouseEvent): void;
  (e: "unit-drop", unit: NUnit, destinationUnit: NUnit, target: DropTarget): void;
}
const emit = defineEmits(["unit-action", "unit-click", "unit-drop"]);

const activeUnitId = injectStrict(activeUnitKey);
const activeParentId = injectStrict(activeParentKey);

let isDragged = ref(false);
let subTree = ref();
const isDragOver = ref(false);
const isDragOverBelow = ref(false);
const isDragOverAbove = ref(false);

const unit = computed(() => props.item.unit);
const isOpen = computed({
  get(): boolean {
    return !!props.item.unit._isOpen;
  },
  set(v: boolean) {
    props.item.unit._isOpen = v;
  },
});

const dragStore = useDragStore();
const settingsStore = useSettingsStore();
const { selectedUnitIds } = useSelectedUnits();

const unitLabel = computed(() =>
  settingsStore.orbatShortName ? unit.value.shortName || unit.value.name : unit.value.name
);

const dragStart = (ev: DragEvent) => {
  const { dataTransfer } = ev;
  if (dataTransfer) {
    dataTransfer.setData("text", DragOperations.OrbatDrag);
    dataTransfer.dropEffect = "copy";
  }
  dragStore.draggedUnit = props.item.unit as unknown as Unit;
  setTimeout(() => (isDragged.value = true), 10);
};

const dragEnd = (ev: DragEvent) => {
  dragStore.draggedUnit = null;
  isDragged.value = false;
};

const onDrop = (ev: DragEvent) => {
  if (
    !(
      ev.dataTransfer?.getData("text") === DragOperations.OrbatDrag &&
      dragStore.draggedUnit
    )
  )
    return;
  isDragOver.value = false;
  let target: DropTarget = "on";
  if (isDragOverAbove.value) target = "above";
  if (isDragOverBelow.value) target = "below";
  isDragOverAbove.value = false;
  isDragOverBelow.value = false;
  if (dragStore.draggedUnit.id === props.item.unit.id) return;
  emit("unit-drop", dragStore.draggedUnit as unknown as NUnit, props.item.unit, target);
  isOpen.value = true;
};

const activeUnitStore = useActiveUnitStore();

const onUnitMenuAction = (unit: NUnit, action: UnitAction) => {
  emit("unit-action", unit, action);
};

const onUnitClick = (unit: NUnit, event: MouseEvent) => {
  emit("unit-click", unit, event);
};

const onUnitDrop = (unit: NUnit, destinationUnit: NUnit, target: DropTarget) =>
  emit("unit-drop", unit, destinationUnit, target);

const isActiveUnit = computed(() => activeUnitId.value === props.item.unit.id);
const isActiveParent = computed(() => activeParentId.value === props.item.unit.id);

const hasActiveChildren = computed(() =>
  activeUnitStore.activeUnitParentIds.value.includes(props.item.unit.id)
);

const { unitMenuItems: menuItems } = useUnitMenu(props.item);

const isParent = computed(() =>
  Boolean(props.item.children && props.item.children.length)
);
</script>
