<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import DotsMenu from "./DotsMenu.vue";
import OrbatTree from "./OrbatTree.vue";
import { ChevronUpIcon } from "@heroicons/vue/24/solid";
import { IconLockOutline } from "@iconify-prerendered/vue-mdi";
import { SideAction, SideActions, UnitAction, UnitActions } from "@/types/constants";
import SecondaryButton from "./SecondaryButton.vue";
import EditSideGroupForm from "./EditSideGroupForm.vue";
import { NSideGroup, NUnit } from "@/types/internalModels";
import { MenuItemData } from "./types";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";

import {
  getSideGroupDragItem,
  isSideGroupDragItem,
  isUnitDragItem,
} from "@/types/draggables";
import {
  attachInstruction,
  extractInstruction,
  Instruction,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item";
import { CleanupFn } from "@atlaskit/pragmatic-drag-and-drop/types";
import TreeDropIndicator from "@/components/TreeDropIndicator.vue";
import { IconDrag } from "@iconify-prerendered/vue-mdi";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { useTimeoutFn } from "@vueuse/core";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";

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
const dragRef = ref<HTMLElement | null>(null);
const isDragging = ref(false);
const instruction = ref<Instruction | null>(null);

const {
  store: { state },
} = injectStrict(activeScenarioKey);

const isDragOver = ref(false);
const isOpen = ref(true);

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

const isLocked = computed(
  () => !!(props.group.locked || state.sideMap[props.group._pid!].locked),
);

const isSideGroupLocked = computed(() => !!props.group.locked);

const isSideLocked = computed(() => !!state.sideMap[props.group._pid!].locked);

const combinedSymbolOptions = computed(() => {
  return {
    ...(state.sideMap[props.group._pid!].symbolOptions || {}),
    ...(props.group.symbolOptions || {}),
  };
});

const showEditForm = ref(false);
if (props.group._isNew) {
  showEditForm.value = true;
}

let dndCleanup: CleanupFn = () => {};

onMounted(() => {
  if (!dropRef.value) {
    return;
  }
  dndCleanup = combine(
    draggable({
      element: dropRef.value!,
      dragHandle: dragRef.value!,
      getInitialData: () => getSideGroupDragItem({ sideGroup: props.group }),
      canDrag: () => !isLocked.value,
      onDragStart: () => {
        isDragging.value = true;
      },
      onDrop: () => {
        isDragging.value = false;
      },
    }),
    dropTargetForElements({
      element: dropRef.value,
      getData: ({ input, element, source }) => {
        const data = getSideGroupDragItem({ sideGroup: props.group });
        return attachInstruction(data, {
          input,
          element,
          currentLevel: 0,
          indentPerLevel: 0,
          block: isSideGroupDragItem(source.data)
            ? ["make-child", "reparent"]
            : ["reparent", "instruction-blocked", "reorder-above", "reorder-below"],
          mode: "standard",
        });
      },
      canDrop: ({ source }) => {
        return (
          !isLocked.value &&
          (isUnitDragItem(source.data) ||
            (isSideGroupDragItem(source.data) &&
              source.data.sideGroup.id !== props.group.id))
        );
      },
      onDragEnter: ({ self }) => {
        isDragOver.value = true;
      },
      onDrag: (args) => {
        if (isUnitDragItem(args.source.data) && !isOpen.value && !isPending.value) {
          startOpenTimeout();
        }
        instruction.value = extractInstruction(args.self.data);
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
        if (isUnitDragItem(args.source.data) && !isOpen.value) {
          isOpen.value = true;
        }
      },
    }),
  );
});

onUnmounted(() => {
  dndCleanup();
});

const toggleOpen = () => {
  isOpen.value = !isOpen.value;
};

const sideGroupMenuItems = computed((): MenuItemData<SideAction>[] => [
  {
    label: "Add root unit",
    action: SideActions.AddSubordinate,
    disabled: isLocked.value,
  },
  { label: "Edit group", action: SideActions.Edit, disabled: isLocked.value },
  { label: "Delete group", action: SideActions.Delete, disabled: isLocked.value },
  { label: "Move up", action: SideActions.MoveUp, disabled: isLocked.value },
  { label: "Move down", action: SideActions.MoveDown, disabled: isLocked.value },
  isSideGroupLocked.value
    ? { label: "Unlock group", action: SideActions.Unlock, disabled: isSideLocked.value }
    : { label: "Lock group", action: SideActions.Lock, disabled: isSideLocked.value },
]);

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
<template>
  <div>
    <header
      class="group relative mt-4 flex items-center justify-between py-0"
      :class="isDragging ? 'opacity-20' : ''"
      ref="dropRef"
      :id="`osg-${group.id}`"
    >
      <IconDrag
        class="h-6 w-6 cursor-move text-gray-400 group-focus-within:opacity-100 group-hover:opacity-100 sm:-ml-3 sm:opacity-0"
        ref="dragRef"
      />
      <div class="flex flex-auto items-center">
        <button
          @click="toggleOpen"
          class="flex w-full items-center justify-between text-left"
        >
          <span
            class="text-base font-medium text-gray-800 hover:text-gray-900 dark:text-gray-300"
          >
            {{ group.name || "Units" }}
          </span>
          <ChevronUpIcon
            :class="isOpen ? 'rotate-180 transform' : ''"
            class="h-6 w-6 text-gray-400 group-hover:text-gray-900"
          />
        </button>
      </div>
      <IconLockOutline
        v-if="isLocked"
        class="size-5 text-gray-400"
        :class="isSideLocked ? 'opacity-40' : ''"
      />
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
