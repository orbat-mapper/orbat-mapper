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
        :units="group.units"
        class="mt-1"
        :ref="setItemRef"
        :filter-query="filterQuery"
        :location-filter="hasLocationFilter"
        @unit-action="onUnitAction"
      />
      <div
        v-if="!group?.units.length"
        class="mr-4 flex justify-center border-2 border-dashed border-gray-300 p-8"
      >
        <SecondaryButton @click="addGroupUnit(group)">Add root unit </SecondaryButton>
      </div>
    </DisclosurePanel>
  </Disclosure>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import DotsMenu, { MenuItemData } from "./DotsMenu.vue";
import OrbatTree from "./OrbatTree.vue";
import { onBeforeUpdate, PropType, ref } from "vue";
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/vue";
import { ChevronUpIcon } from "@heroicons/vue/solid";
import { SideGroup } from "../types/scenarioModels";
import { DragOperations, SideActions } from "../types/constants";
import { useDragStore } from "../stores/dragStore";
import InputGroup from "./InputGroup.vue";
import PlainButton from "./PlainButton.vue";
import SecondaryButton from "./SecondaryButton.vue";
import EditSideGroupForm from "./EditSideGroupForm.vue";
import { useUnitActions } from "../composables/scenarioActions";
import { useUnitManipulationStore } from "../stores/scenarioManipulation";

export default defineComponent({
  name: "OrbatSideGroup",
  components: {
    EditSideGroupForm,
    SecondaryButton,
    PlainButton,
    InputGroup,
    DotsMenu,
    OrbatTree,
    Disclosure,
    DisclosureButton,
    DisclosurePanel,
    ChevronUpIcon,
  },
  props: {
    group: { type: Object as PropType<SideGroup>, required: true },
    filterQuery: String,
    hasLocationFilter: Boolean,
  },
  setup(props) {
    let treeRef = ref<InstanceType<typeof OrbatTree>>();
    let treeRefs: InstanceType<typeof OrbatTree>[] = [];
    const dragStore = useDragStore();
    const unitManipulationStore = useUnitManipulationStore();
    const isDragOver = ref(false);

    const showEditForm = ref(false);
    if (props.group._isNew) {
      showEditForm.value = true;
    }

    const sideGroupMenuItems: MenuItemData<SideActions>[] = [
      { label: "Expand", action: SideActions.Expand },
      { label: "Add root unit", action: SideActions.AddSubordinate },
      { label: "Edit group", action: SideActions.Edit },
    ];

    onBeforeUpdate(() => {
      treeRefs = [];
    });

    const onSideGroupAction = (group: SideGroup, action: SideActions) => {
      if (action === SideActions.Expand) {
        treeRefs.forEach((tree) => tree?.expandChildren());
      } else if (action === SideActions.AddSubordinate) {
        unitManipulationStore.createSubordinateUnit(group);
      } else if (action === SideActions.Edit) {
        showEditForm.value = true;
      }
    };

    const addGroupUnit = (group: SideGroup) => {
      onSideGroupAction(group, SideActions.AddSubordinate);
    };

    const { onUnitAction } = useUnitActions();

    const setItemRef = (el: any) => {
      if (el) treeRefs.push(el);
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
      const unitManipulationStore = useUnitManipulationStore();
      unitManipulationStore.changeUnitParent(dragStore.draggedUnit, props.group);
    };

    return {
      dragStore,
      sideGroupMenuItems,
      onUnitAction,
      onSideGroupAction,
      treeRef,
      setItemRef,
      addGroupUnit,
      showEditForm,
      onDrop,
      isDragOver,
    };
  },
});
</script>
