<template>
  <Disclosure v-slot="{ open }" default-open>
    <div class="group relative mt-4 flex items-center justify-between py-0">
      <DisclosureButton class="flex w-full items-center justify-between text-left">
        <p
          class="text-base font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300"
          :class="{ 'font-bold underline': isDragOver }"
          @dragover.prevent="isDragOver = true"
          @drop.prevent="onDrop"
          @dragleave="isDragOver = false"
        >
          {{ group.name || "Units" }}
        </p>
        <ChevronUpIcon
          :class="open ? 'rotate-180 transform' : ''"
          class="h-6 w-6 text-gray-400 group-hover:text-gray-900"
        />
      </DisclosureButton>
      <DotsMenu
        :items="sideGroupMenuItems"
        @action="onSideGroupAction(group, $event)"
        class="flex-shrink-0 pr-2"
      />
    </div>
    <EditSideGroupForm
      v-if="showEditForm"
      @close="showEditForm = false"
      :side-group-id="group.id"
      class="-ml-6"
    />
    <DisclosurePanel>
      <OrbatTree
        :units="group.subUnits"
        :unit-map="state.unitMap"
        class="mt-1"
        :filter-query="filterQuery"
        :location-filter="hasLocationFilter"
        @unit-action="onUnitAction"
        @unit-click="(unit, event) => emit('unit-click', unit, event)"
        @unit-drop="onUnitDrop"
      />
      <div
        v-if="!group.subUnits.length"
        class="mr-4 flex justify-center border-2 border-dashed border-gray-300 p-8"
      >
        <SecondaryButton @click="addGroupUnit(group)">Add root unit </SecondaryButton>
      </div>
    </DisclosurePanel>
  </Disclosure>
</template>

<script setup lang="ts">
import { ref } from "vue";
import DotsMenu from "./DotsMenu.vue";
import OrbatTree from "./OrbatTree.vue";
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/vue";
import { ChevronUpIcon } from "@heroicons/vue/24/solid";
import {
  DragOperations,
  SideAction,
  SideActions,
  UnitAction,
  UnitActions,
} from "@/types/constants";
import { useDragStore } from "@/stores/dragStore";
import SecondaryButton from "./SecondaryButton.vue";
import EditSideGroupForm from "./EditSideGroupForm.vue";
import { NSideGroup, NUnit } from "@/types/internalModels";
import { ScenarioState } from "@/scenariostore/newScenarioStore";
import { DropTarget, MenuItemData } from "./types";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";

interface Props {
  group: NSideGroup;
  filterQuery?: string;
  hasLocationFilter?: boolean;
  state: ScenarioState;
}
const props = defineProps<Props>();

interface Emits {
  (e: "unit-action", unit: NUnit, action: UnitAction): void;
  (e: "unit-click", unit: NUnit, event: MouseEvent): void;
  (
    e: "unit-drop",
    unit: NUnit,
    destinationUnit: NUnit | NSideGroup,
    target: DropTarget
  ): void;
  (e: "sidegroup-action", unit: NSideGroup, action: SideAction): void;
}
const emit = defineEmits<Emits>();

const { unitActions } = injectStrict(activeScenarioKey);

const dragStore = useDragStore();
const isDragOver = ref(false);

const showEditForm = ref(false);
if (props.group._isNew) {
  showEditForm.value = true;
}

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

const onUnitDrop = (unit: NUnit, destinationUnit: NUnit, target: DropTarget) =>
  emit("unit-drop", unit, destinationUnit, target);

const onDrop = (ev: DragEvent) => {
  if (
    !(
      ev.dataTransfer?.getData("text") === DragOperations.OrbatDrag &&
      dragStore.draggedUnit
    )
  )
    return;
  isDragOver.value = false;
  emit("unit-drop", dragStore.draggedUnit as unknown as NUnit, props.group, "on");
};
</script>
