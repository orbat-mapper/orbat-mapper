<template>
  <li :id="'o-' + unit.id">
    <div
      class="flex items-center hover:bg-gray-200 py-2 pl-2 group justify-between relative"
      @dblclick="isOpen = !isOpen"
      @click="onUnitClick"
    >
      <div class="flex items-center space-x-1">
        <div class="w-6 h-6">
          <button
            v-if="isParent"
            @click.stop="isOpen = !isOpen"
            class=""
            @dragenter.prevent="isOpen = true"
          >
            <ChevronRightIcon
              class="h-6 w-6 transform transition-transform group-hover:text-gray-900 text-gray-500"
              :class="{
                'rotate-90': isOpen,
                'text-red-600': hasActiveChildren,
              }"
            />
          </button>
        </div>
        <button class="flex space-x-1 items-center">
          <div
            class="flex space-x-1 items-center"
            draggable="true"
            @dragstart="dragStart"
            @dragend="dragEnd"
            :class="{ 'opacity-20': isDragged }"
          >
            <div class="flex-shrink-0 w-8 flex justify-center cursor-move">
              <MilSymbol
                :sidc="unit.sidc"
                :size="settingsStore.orbatIconSize"
                :modifiers="{ standard: settingsStore.symbologyStandard }"
                class=""
                @click.stop.prevent=""
              />
            </div>
            <span
              class="flex-auto text-left"
              :class="{
                'font-bold': isActiveUnit,
                'font-bold underline': isDragOver,
              }"
              @dragover.prevent="isDragOver = true"
              @drop.prevent="onDrop"
              @dragleave="isDragOver = false"
              >{{ unit.name }}</span
            >
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
      <OrbatTreeItem
        :ref="setItemRef"
        :item="subUnit"
        v-for="subUnit in item.children"
        :key="subUnit.unit.id"
        @action="onUnitMenuAction"
      />
    </ul>
  </li>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from "vue";
import MilSymbol from "./MilSymbol.vue";
import { OrbatItemData, Unit } from "../types/models";
//@ts-ignore
import { ChevronRightIcon } from "@heroicons/vue/solid";
import { useActiveUnitStore, useDragStore } from "../stores/dragStore";
import { DragOperations, UnitActions } from "../types/constants";
import DotsMenu from "./DotsMenu.vue";
import { useExpandTree } from "./helpers";
import { useUnitMenu } from "../composables/scenarioActions";
import { useUnitManipulationStore } from "../stores/scenarioManipulation";
import { useSettingsStore } from "../stores/settingsStore";

export default defineComponent({
  name: "OrbatTreeItem",
  components: {
    DotsMenu,
    MilSymbol,
    ChevronRightIcon,
  },
  props: {
    item: { type: Object as PropType<OrbatItemData>, required: true },
  },
  emits: ["action"],
  setup(props, { emit }) {
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
      dragStore.draggedUnit = props.item.unit;
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
      const unitManipulationStore = useUnitManipulationStore();
      unitManipulationStore.changeUnitParent(
        dragStore.draggedUnit,
        props.item.unit
      );
      isOpen.value = true;
    };

    const activeUnitStore = useActiveUnitStore();

    const onUnitMenuAction = async (unit: Unit, action: UnitActions) => {
      if (action === UnitActions.Expand) {
        await expandChildren();
      } else {
        emit("action", unit, action);
      }
    };

    const onUnitClick = () => {
      activeUnitStore.activeUnit = props.item.unit;
    };

    const isActiveUnit = computed(
      () => activeUnitStore.activeUnit === props.item.unit
    );

    const hasActiveChildren = computed(() =>
      Boolean(activeUnitStore?.activeUnitParents?.includes(props.item.unit.id))
    );

    const { unitMenuItems: menuItems } = useUnitMenu(props.item);

    const { setItemRef, expandChildren } = useExpandTree(isOpen);

    return {
      isOpen,
      isDragged,
      isActiveUnit,
      dragStart,
      dragEnd,
      onDrop,
      menuItems,
      onUnitMenuAction,
      onUnitClick,
      subTree,
      setItemRef,
      expandChildren,
      unit,
      hasActiveChildren,
      settingsStore,
      isDragOver,
    };
  },

  computed: {
    isParent(): boolean {
      return Boolean(this.item.children && this.item.children.length);
    },
  },
  methods: {},
});
</script>
