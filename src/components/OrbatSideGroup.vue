<template>
  <div>
    <header
      class="group relative mt-4 flex items-center justify-between py-0"
      ref="dropRef"
    >
      <button
        @click="toggleOpen"
        class="flex w-full items-center justify-between text-left"
      >
        <span
          class="text-base font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300"
        >
          {{ group.name || "Units" }}
        </span>
        <ChevronUpIcon
          :class="isOpen ? 'rotate-180 transform' : ''"
          class="h-6 w-6 text-gray-400 group-hover:text-gray-900"
        />
      </button>
      <DotsMenu
        :items="sideGroupMenuItems"
        @action="onSideGroupAction(group, $event)"
        class="flex-shrink-0 pr-2"
      />
      <TreeDropIndicator
        v-if="instruction"
        :instruction="instruction"
        class="z-10 -my-2 -ml-2"
      />
    </header>
    <EditSideGroupForm
      v-if="showEditForm"
      @close="showEditForm = false"
      :side-group-id="group.id"
      class="-ml-6"
    />
    <section v-if="isOpen">
      <OrbatTree
        :units="group.subUnits"
        :unit-map="state.unitMap"
        class="mt-1"
        :filter-query="filterQuery"
        :location-filter="hasLocationFilter"
        @unit-action="onUnitAction"
        @unit-click="(unit, event) => emit('unit-click', unit, event)"
        :symbol-options="combinedSymbolOptions"
      />
      <div
        v-if="!group.subUnits.length"
        class="mr-4 flex justify-center border-2 border-dashed border-gray-300 p-8"
      >
        <SecondaryButton @click="addGroupUnit(group)">Add root unit </SecondaryButton>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import DotsMenu from "./DotsMenu.vue";
import OrbatTree from "./OrbatTree.vue";
import { ChevronUpIcon } from "@heroicons/vue/24/solid";
import { SideAction, SideActions, UnitAction, UnitActions } from "@/types/constants";
import SecondaryButton from "./SecondaryButton.vue";
import EditSideGroupForm from "./EditSideGroupForm.vue";
import { NSideGroup, NUnit } from "@/types/internalModels";
import { DropTarget, MenuItemData } from "./types";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";

import { getSideGroupDragItem, isUnitDragItem } from "@/types/draggables";
import {
  attachInstruction,
  extractInstruction,
  Instruction,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item";
import { CleanupFn } from "@atlaskit/pragmatic-drag-and-drop/types";
import TreeDropIndicator from "@/components/TreeDropIndicator.vue";
import { IconDrag } from "@iconify-prerendered/vue-mdi";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

interface Props {
  group: NSideGroup;
  filterQuery?: string;
  hasLocationFilter?: boolean;
}
const props = defineProps<Props>();

interface Emits {
  (e: "unit-action", unit: NUnit, action: UnitAction): void;
  (e: "unit-click", unit: NUnit, event: MouseEvent): void;

  (e: "sidegroup-action", unit: NSideGroup, action: SideAction): void;
}

const emit = defineEmits<Emits>();
const dropRef = ref<HTMLElement | null>(null);
const instruction = ref<Instruction | null>(null);

const {
  unitActions,
  store: { state },
} = injectStrict(activeScenarioKey);

const combinedSymbolOptions = computed(() => {
  return {
    ...(state.sideMap[props.group._pid!].symbolOptions || {}),
    ...(props.group.symbolOptions || {}),
  };
});

const isDragOver = ref(false);
const isOpen = ref(true);

const showEditForm = ref(false);
if (props.group._isNew) {
  showEditForm.value = true;
}

let dndCleanup: CleanupFn = () => {};

onMounted(() => {
  if (!dropRef.value) {
    return;
  }
  dndCleanup = dropTargetForElements({
    element: dropRef.value,
    getData: ({ input, element }) => {
      const data = getSideGroupDragItem({ sideGroup: props.group });
      return attachInstruction(data, {
        input,
        element,
        currentLevel: 0,
        indentPerLevel: 0,
        block: ["reparent", "instruction-blocked", "reorder-above", "reorder-below"],
        mode: "standard",
      });
    },
    canDrop: ({ source }) => {
      return isUnitDragItem(source.data);
    },
    onDragEnter: ({ self }) => {
      isDragOver.value = true;
    },
    onDrag: (args) => {
      instruction.value = extractInstruction(args.self.data);
    },

    onDragLeave: () => {
      isDragOver.value = false;
      instruction.value = null;
    },
    onDrop: (args) => {
      isDragOver.value = false;
      instruction.value = null;
    },
  });
});

onUnmounted(() => {
  dndCleanup();
});

const toggleOpen = () => {
  isOpen.value = !isOpen.value;
};

const sideGroupMenuItems: MenuItemData<SideAction>[] = [
  { label: "Expand", action: SideActions.Expand },
  { label: "Add root unit", action: SideActions.AddSubordinate },
  { label: "Edit group", action: SideActions.Edit },
  { label: "Delete group", action: SideActions.Delete },
  { label: "Move up", action: SideActions.MoveUp },
  { label: "Move down", action: SideActions.MoveDown },
];

const onSideGroupAction = (group: NSideGroup, action: SideAction) => {
  if (action === SideActions.Expand) {
  } else if (action === SideActions.AddSubordinate) {
    emit("unit-action", group as unknown as NUnit, UnitActions.AddSubordinate);
  } else if (action === SideActions.Edit) {
    showEditForm.value = true;
  } else {
    emit("sidegroup-action", group, action);
  }
};

const addGroupUnit = (group: NSideGroup) => {
  onSideGroupAction(group, SideActions.AddSubordinate);
};

const onUnitAction = (unit: NUnit, action: UnitAction) => {
  emit("unit-action", unit, action);
};
</script>
