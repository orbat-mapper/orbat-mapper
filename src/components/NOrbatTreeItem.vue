<template>
  <li :id="'o-' + unit.id" class="text-gray-900 dark:text-gray-400">
    <div
      class="group relative flex items-center justify-between py-2 pl-2 hover:bg-gray-200 dark:hover:bg-gray-700"
      @dblclick="isOpen = !isOpen"
      @click="onUnitClick(unit)"
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
              class="h-6 w-6 transform text-gray-500 transition-transform group-hover:text-gray-900"
              :class="{
                'rotate-90': isOpen,
                'text-red-600': hasActiveChildren,
              }"
            />
          </button>
        </div>
        <button class="flex items-center space-x-1">
          <div
            class="flex items-center space-x-1"
            draggable="true"
            @dragstart="dragStart"
            @dragend="dragEnd"
            :class="{ 'opacity-20': isDragged }"
          >
            <div
              class="flex flex-shrink-0 cursor-move justify-center"
              :style="{ width: settingsStore.orbatIconSize + 'pt' }"
            >
              <MilSymbol
                :sidc="unit.sidc"
                :size="settingsStore.orbatIconSize"
                :modifiers="{ standard: settingsStore.symbologyStandard }"
                class=""
                @click.stop.prevent=""
              />
            </div>
            <span
              class="flex-auto pl-1.5 text-left"
              :class="{
                'font-bold': isActiveUnit,
                'font-bold underline': isDragOver,
              }"
              @dragover.prevent="isDragOver = true"
              @drop.prevent="onDrop"
              @dragleave="isDragOver = false"
              >{{ unit.name }}
            </span>
          </div>
        </button>
      </div>

      <DotsMenu
        class="flex-shrink-0 pr-2"
        :items="menuItems"
        @action="onUnitMenuAction(unit, $event)"
      />
    </div>
    <ul v-if="isOpen" class="ml-6" ref="subTree">
      <NOrbatTreeItem
        :item="subUnit"
        v-for="subUnit in item.children"
        :key="subUnit.unit.id"
        @action="onUnitMenuAction"
        @unit-click="onUnitClick"
        @unit-drop="onUnitDrop"
      />
    </ul>
  </li>
</template>

<script setup lang="ts">
import { computed, inject, ref } from "vue";
import MilSymbol from "./MilSymbol.vue";
import { Unit } from "../types/scenarioModels";
//@ts-ignore
import { ChevronRightIcon } from "@heroicons/vue/solid";
import { useActiveUnitStore, useDragStore } from "../stores/dragStore";
import { DragOperations, UnitActions } from "../types/constants";
import DotsMenu from "./DotsMenu.vue";
import { useUnitMenu } from "../composables/scenarioActions";
import { useSettingsStore } from "../stores/settingsStore";
import { activeUnitKey } from "./injects";
import { NOrbatItemData, NUnit } from "../stores/newScenarioStore";

interface Props {
  item: NOrbatItemData;
}
const props = defineProps<Props>();

interface Emits {
  (e: "action", unit: NUnit, action: UnitActions): void;
  (e: "unit-click", unit: NUnit): void;
  (e: "unit-drop", unit: NUnit, destinationUnit: NUnit): void;
}
const emit = defineEmits<Emits>();

const activeUnitId = inject(activeUnitKey);

let isDragged = ref(false);
let subTree = ref();
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

const dragStore = useDragStore();
const settingsStore = useSettingsStore();

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
  if (dragStore.draggedUnit.id === props.item.unit.id) return;
  emit("unit-drop", dragStore.draggedUnit as unknown as NUnit, props.item.unit);
  // const unitManipulationStore = useUnitManipulationStore();
  // unitManipulationStore.changeUnitParent(
  //   dragStore.draggedUnit,
  //   props.item.unit as unknown as Unit
  // );
  isOpen.value = true;
};

const activeUnitStore = useActiveUnitStore();

const onUnitMenuAction = async (unit: NUnit, action: UnitActions) => {
  emit("action", unit, action);
};

const onUnitClick = (unit: NUnit) => {
  emit("unit-click", unit);
};

const onUnitDrop = (unit: NUnit, destinationUnit: NUnit) =>
  emit("unit-drop", unit, destinationUnit);

const isActiveUnit = computed(() => activeUnitId?.value === props.item.unit.id);

const hasActiveChildren = computed(() =>
  Boolean(activeUnitStore?.activeUnitParents?.includes(props.item.unit.id))
);

const { unitMenuItems: menuItems } = useUnitMenu(props.item);

const isParent = computed(() =>
  Boolean(props.item.children && props.item.children.length)
);
</script>
