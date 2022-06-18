<template>
  <Disclosure v-slot="{ open }" default-open>
    <section class="pl-6">
      <header
        class="relative -ml-6 block flex items-center justify-between border-b-2 border-t-2 border-gray-300 bg-gray-200 py-1 pl-6 dark:border-gray-600 dark:bg-gray-700"
      >
        <DisclosureButton class="flex w-full items-center justify-between text-left">
          <h4 class="text-base font-medium text-gray-900 dark:text-gray-200">
            {{ side.name }}
          </h4>
          <ChevronUpIcon
            :class="open ? 'rotate-180 transform' : ''"
            class="h-6 w-6 text-gray-400 group-hover:text-gray-900"
          />
        </DisclosureButton>

        <DotsMenu
          :items="sideMenuItems"
          @action="onSideAction"
          class="flex-shrink-0 pr-2"
        />
      </header>
      <EditSideForm
        v-if="showEditSideForm"
        :side-id="side.id"
        @close="showEditSideForm = false"
        class="-ml-6"
      />
      <DisclosurePanel>
        <div class="mt-4 mr-10">
          <FilterQueryInput
            v-model="filterQuery"
            v-model:location-filter="hasLocationFilter"
          />
        </div>
        <div v-for="group in sideGroups" :key="group.id">
          <NOrbatSideGroup
            :group="group"
            :filter-query="debouncedFilterQuery"
            :has-location-filter="hasLocationFilter"
            :state="state"
            @unit-action="onUnitAction"
            @unit-click="emit('unit-click', $event)"
            @unit-drop="onUnitDrop"
          >
          </NOrbatSideGroup>
        </div>
      </DisclosurePanel>
    </section>
  </Disclosure>
</template>

<script setup lang="ts">
import DotsMenu, { MenuItemData } from "./DotsMenu.vue";
import { computed, inject, ref } from "vue";
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/vue";
import { ChevronUpIcon } from "@heroicons/vue/solid";
import { SideActions, UnitActions } from "@/types/constants";
import { useScenarioStore } from "@/stores/scenarioStore";
import { useDebounce } from "@vueuse/core";
import FilterQueryInput from "./FilterQueryInput.vue";
import EditSideForm from "./NEditSideForm.vue";
import NOrbatSideGroup from "./NOrbatSideGroup.vue";
import { NSide, NSideGroup, NUnit } from "@/types/internalModels";
import { ScenarioState } from "@/scenariostore/newScenarioStore";
import { DropTarget } from "./types";
import { activeScenarioKey } from "@/components/injects";

interface Props {
  side: NSide;
  state: ScenarioState;
}
const props = defineProps<Props>();

interface Emits {
  (e: "unit-action", unit: NUnit, action: UnitActions): void;
  (e: "unit-click", unit: NUnit): void;
  (
    e: "unit-drop",
    unit: NUnit,
    destinationUnit: NUnit | NSideGroup,
    target: DropTarget
  ): void;
}
const emit = defineEmits<Emits>();

const { store, unitActions } = inject(activeScenarioKey)!;

const hasLocationFilter = ref(false);
const filterQuery = ref("");

const debouncedFilterQuery = useDebounce(filterQuery, 100);
const sideGroups = computed(() =>
  props.side.groups.map((id) => props.state.sideGroupMap[id])
);

const showEditSideForm = ref(false);

if (props.side._isNew) showEditSideForm.value = true;

const sideMenuItems: MenuItemData<SideActions>[] = [
  // { label: "Expand", action: SideActions.Expand },
  { label: "Edit", action: SideActions.Edit },
  { label: "Add group", action: SideActions.AddGroup },
];

const onSideAction = (action: SideActions) => {
  if (action === SideActions.Expand) {
  } else if (action === SideActions.AddSubordinate) {
    // unitManipulationStore.createSubordinateUnit(props.side.groups[0]);
  } else if (action === SideActions.AddGroup) {
    unitActions.addSideGroup(props.side.id);
    // scenarioStore.addSideGroup(props.side);
  } else if (action === SideActions.Edit) {
    showEditSideForm.value = true;
  }
};

const onUnitAction = (unit: NUnit, action: UnitActions) => {
  emit("unit-action", unit, action);
};

const onUnitDrop = (
  unit: NUnit,
  destinationUnit: NUnit | NSideGroup,
  target: DropTarget
) => emit("unit-drop", unit, destinationUnit, target);
</script>
