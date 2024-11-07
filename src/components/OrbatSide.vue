<template>
  <div class="pl-4">
    <header
      ref="dropRef"
      :id="`os-${side.id}`"
      class="group relative -ml-4 flex items-center justify-between border-b-2 border-t-2 border-gray-300 bg-gray-200 py-1 pl-4 dark:border-gray-600 dark:bg-gray-700"
    >
      <IconDrag
        class="h-6 w-6 flex-none cursor-move text-gray-500 group-focus-within:opacity-100 group-hover:opacity-100 sm:-ml-3 sm:opacity-0"
        ref="dragRef"
      />
      <button
        @click="toggleOpen"
        class="flex w-full items-center justify-between text-left"
      >
        <span class="text-base font-medium text-gray-900 dark:text-gray-200">
          {{ side.name }}
        </span>
        <ChevronUpIcon
          :class="isOpen ? 'rotate-180 transform' : ''"
          class="h-6 w-6 text-gray-400 group-hover:text-gray-900"
        />
      </button>
      <Switch
        v-if="!hideFilter"
        v-model="showFilter"
        v-slot="{ checked }"
        title="Toggle ORBAT filter"
        class="ml-1 text-gray-400 hover:text-gray-900"
      >
        <span class="sr-only">Toggle ORBAT filter</span>
        <IconFilterVariantPlus v-if="checked" class="h-5 w-5" aria-hidden="true" />
        <IconFilterVariant v-else class="h-5 w-5" aria-hidden="true" />
      </Switch>
      <IconLockOutline v-if="isLocked" class="h-6 w-6 text-gray-400" />
      <button
        v-if="isHidden"
        type="button"
        class="ml-1 text-gray-400 hover:text-gray-700"
        title="Toggle visibility"
        @click="onSideAction(isHidden ? SideActions.Show : SideActions.Hide)"
      >
        <IconEyeOff v-if="isHidden" class="h-5 w-5" />
        <IconEye class="h-5 w-5" v-else />
      </button>
      <SideDropdownMenu
        @action="onSideAction"
        :is-locked="isLocked"
        :is-hidden="isHidden"
      />
      <TreeDropIndicator v-if="instruction" :instruction="instruction" class="z-10" />
    </header>
    <EditSideForm
      v-if="showEditSideForm"
      :side-id="side.id"
      @close="showEditSideForm = false"
      class="-ml-6"
    />
    <div v-show="isOpen">
      <div v-if="showFilter" class="mr-10 mt-4">
        <FilterQueryInput
          v-model="filterQuery"
          v-model:location-filter="hasLocationFilter"
        />
      </div>
      <div v-for="group in sideGroups" :key="group.id">
        <OrbatSideGroup
          :group="group"
          :filter-query="debouncedFilterQuery"
          :has-location-filter="hasLocationFilter"
          @unit-action="onUnitAction"
          @unit-click="(unit, event) => emit('unit-click', unit, event)"
          @sidegroup-action="onSideGroupAction"
        >
        </OrbatSideGroup>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { ChevronUpIcon } from "@heroicons/vue/24/solid";
import {
  IconDrag,
  IconFilterVariant,
  IconFilterVariantPlus,
  IconLockOutline,
  IconEyeOff,
  IconEye,
} from "@iconify-prerendered/vue-mdi";
import { SideAction, SideActions, type UnitAction } from "@/types/constants";
import { useDebounce, useTimeoutFn } from "@vueuse/core";
import FilterQueryInput from "./FilterQueryInput.vue";
import EditSideForm from "./EditSideForm.vue";
import OrbatSideGroup from "./OrbatSideGroup.vue";
import { NSide, NSideGroup, NUnit } from "@/types/internalModels";
import { DropTarget } from "./types";
import { activeScenarioKey } from "@/components/injects";
import { injectStrict } from "@/utils";
import { Switch } from "@headlessui/vue";
import {
  attachInstruction,
  extractInstruction,
  Instruction,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item";
import { CleanupFn } from "@atlaskit/pragmatic-drag-and-drop/types";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import {
  getSideDragItem,
  isSideDragItem,
  isSideGroupDragItem,
  isUnitDragItem,
} from "@/types/draggables";
import TreeDropIndicator from "@/components/TreeDropIndicator.vue";
import SideDropdownMenu from "@/modules/scenarioeditor/SideDropdownMenu.vue";

interface Props {
  side: NSide;
  hideFilter?: boolean;
}

const props = withDefaults(defineProps<Props>(), { hideFilter: false });

interface Emits {
  (e: "unit-action", unit: NUnit, action: UnitAction): void;

  (e: "unit-click", unit: NUnit, event: MouseEvent): void;

  (
    e: "unit-drop",
    unit: NUnit,
    destinationUnit: NUnit | NSideGroup,
    target: DropTarget,
  ): void;

  (e: "side-action", unit: NSide, action: SideAction): void;
}

const emit = defineEmits<Emits>();

const { store, unitActions } = injectStrict(activeScenarioKey);

const isOpen = ref(true);
const dropRef = ref<HTMLElement | null>(null);
const dragRef = ref<HTMLElement | null>(null);
const isDragging = ref(false);
const instruction = ref<Instruction | null>(null);
const isDragOver = ref(false);

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
const hasLocationFilter = ref(false);
const filterQuery = ref("");

const showFilter = ref(false);
const debouncedFilterQuery = useDebounce(filterQuery, 100);
const isLocked = computed(() => !!props.side.locked);
const isHidden = computed(() => props.side.isHidden);

const sideGroups = computed(() =>
  props.side.groups.map((id) => store.state.sideGroupMap[id]),
);
const showEditSideForm = ref(false);

let dndCleanup: CleanupFn = () => {};

onMounted(() => {
  if (!dropRef.value) {
    return;
  }
  dndCleanup = combine(
    draggable({
      element: dropRef.value!,
      dragHandle: dragRef.value!,
      getInitialData: () => getSideDragItem({ side: props.side }),

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
        const data = getSideDragItem({ side: props.side });
        return attachInstruction(data, {
          input,
          element,
          currentLevel: 0,
          indentPerLevel: 0,
          block: isSideDragItem(source.data)
            ? ["make-child", "reparent"]
            : ["reparent", "instruction-blocked", "reorder-above", "reorder-below"],
          mode: "standard",
        });
      },
      canDrop: ({ source }) => {
        return (
          (isUnitDragItem(source.data) && source.data.unit._sid !== props.side.id) ||
          (isSideGroupDragItem(source.data) &&
            source.data.sideGroup._pid !== props.side.id) ||
          (isSideDragItem(source.data) && source.data.side.id !== props.side.id)
        );
      },
      onDragEnter: ({ self }) => {
        isDragOver.value = true;
      },
      onDrag: (args) => {
        if (
          (isUnitDragItem(args.source.data) || isSideGroupDragItem(args.source.data)) &&
          !isOpen.value &&
          !isPending.value
        ) {
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
        if (isSideGroupDragItem(args.source.data) && !isOpen.value) {
          isOpen.value = true;
        }
      },
    }),
  );
});

onUnmounted(() => {
  dndCleanup();
});

if (props.side._isNew) showEditSideForm.value = true;

const onSideAction = (action: SideAction) => {
  if (action === SideActions.Expand) {
  } else if (action === SideActions.AddSubordinate) {
    // unitManipulationStore.createSubordinateUnit(props.side.groups[0]);
  } else if (action === SideActions.AddGroup) {
    unitActions.addSideGroup(props.side.id);
  } else if (action === SideActions.Edit) {
    showEditSideForm.value = true;
  } else {
    emit("side-action", props.side, action);
  }
};

function onSideGroupAction(sideGroup: NSideGroup, action: SideAction) {
  if (action === SideActions.Delete) {
    unitActions.deleteSideGroup(sideGroup.id);
  } else if (action === SideActions.MoveDown) {
    unitActions.reorderSideGroup(sideGroup.id, "down");
  } else if (action === SideActions.MoveUp) {
    unitActions.reorderSideGroup(sideGroup.id, "up");
  } else if (action === SideActions.Lock) {
    unitActions.updateSideGroup(sideGroup.id, { locked: true }, { noUndo: true });
  } else if (action === SideActions.Unlock) {
    unitActions.updateSideGroup(sideGroup.id, { locked: false }, { noUndo: true });
  } else if (action === SideActions.Clone) {
    unitActions.cloneSideGroup(sideGroup.id);
  } else if (action === SideActions.CloneWithState) {
    unitActions.cloneSideGroup(sideGroup.id, { includeState: true });
  } else if (action === SideActions.Hide) {
    unitActions.updateSideGroup(sideGroup.id, { isHidden: true });
  } else if (action === SideActions.Show) {
    unitActions.updateSideGroup(sideGroup.id, { isHidden: false });
  }
}

const onUnitAction = (unit: NUnit, action: UnitAction) => {
  emit("unit-action", unit, action);
};

const toggleOpen = () => {
  isOpen.value = !isOpen.value;
};
</script>
