<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import OrbatTree from "./OrbatTree.vue";
import { ChevronUpIcon } from "@heroicons/vue/24/solid";
import {
  IconDrag,
  IconEye,
  IconEyeOff,
  IconLockOutline,
} from "@iconify-prerendered/vue-mdi";
import {
  type SideAction,
  SideActions,
  type UnitAction,
  UnitActions,
} from "@/types/constants";
import SecondaryButton from "./SecondaryButton.vue";
import EditSideGroupForm from "./EditSideGroupForm.vue";
import type { NSideGroup, NUnit } from "@/types/internalModels";
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
  type Instruction,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item";
import { type CleanupFn } from "@atlaskit/pragmatic-drag-and-drop/types";
import TreeDropIndicator from "@/components/TreeDropIndicator.vue";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { useTimeoutFn } from "@vueuse/core";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import SideGroupDropdownMenu from "@/modules/scenarioeditor/SideGroupDropdownMenu.vue";

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

const isHidden = computed(
  () => !!props.group.isHidden || !!state.sideMap[props.group._pid!].isHidden,
);

const isSideGroupHidden = computed(() => !!props.group.isHidden);
const isSideHidden = computed(() => !!state.sideMap[props.group._pid!].isHidden);
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
      class="group relative mt-1 flex items-center justify-between py-0"
      :class="isDragging ? 'opacity-20' : ''"
      ref="dropRef"
      :id="`osg-${group.id}`"
    >
      <IconDrag
        class="text-muted-foreground h-6 w-6 cursor-move group-focus-within:opacity-100 group-hover:opacity-100 sm:-ml-3 sm:opacity-0"
        ref="dragRef"
      />
      <div class="flex flex-auto items-center">
        <button
          @click="toggleOpen"
          class="flex w-full items-center justify-between text-left"
        >
          <span class="text-heading hover:text-foreground text-sm font-medium">
            {{ group.name || "Units" }}
          </span>
          <ChevronUpIcon
            :class="isOpen ? 'rotate-180 transform' : ''"
            class="text-muted-foreground group-hover:text-foreground size-5"
          />
        </button>
      </div>
      <IconLockOutline
        v-if="isLocked"
        class="text-muted-foreground size-5"
        :class="isSideLocked ? 'opacity-40' : ''"
      />
      <button
        v-if="isHidden"
        type="button"
        class="text-muted-foreground hover:text-foreground ml-1"
        :class="isSideHidden ? 'opacity-40' : ''"
        title="Toggle visibility"
        @click="onSideGroupAction(group, isHidden ? SideActions.Show : SideActions.Hide)"
        :disabled="isSideHidden"
      >
        <IconEyeOff v-if="isHidden" class="h-5 w-5" />
        <IconEye class="h-5 w-5" v-else />
      </button>
      <SideGroupDropdownMenu
        :is-locked="isLocked"
        :is-side-group-locked="isSideGroupLocked"
        :is-side-locked="isSideLocked"
        :is-side-hidden="isSideHidden"
        :is-side-group-hidden="isSideGroupHidden"
        @action="onSideGroupAction(group, $event)"
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
        class="mt-0"
        :class="{ 'opacity-50': isHidden }"
        :filter-query="filterQuery"
        :location-filter="hasLocationFilter"
        @unit-action="onUnitAction"
        @unit-click="(unit, event) => emit('unit-click', unit, event)"
        :symbol-options="combinedSymbolOptions"
      />
      <div
        v-if="!group.subUnits.length"
        class="border-border mr-4 flex justify-center border-2 border-dashed p-8"
      >
        <SecondaryButton @click="addGroupUnit(group)">Add root unit</SecondaryButton>
      </div>
    </section>
  </div>
</template>
