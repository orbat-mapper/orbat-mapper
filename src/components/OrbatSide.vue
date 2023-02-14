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
        <div v-if="showFilter" class="mt-4 mr-10">
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
            :state="state"
            @unit-action="onUnitAction"
            @unit-click="(unit, event) => emit('unit-click', unit, event)"
            @unit-drop="onUnitDrop"
            @sidegroup-action="onSideGroupAction"
          >
          </OrbatSideGroup>
        </div>
      </DisclosurePanel>
    </section>
  </Disclosure>
</template>

<script setup lang="ts">
import DotsMenu from "./DotsMenu.vue";
import { computed, ref } from "vue";
import { Disclosure, DisclosureButton, DisclosurePanel, Switch } from "@headlessui/vue";
import { ChevronUpIcon } from "@heroicons/vue/24/solid";
import { IconFilterVariant, IconFilterVariantPlus } from "@iconify-prerendered/vue-mdi";
import { SideAction, SideActions, type UnitAction } from "@/types/constants";
import { useDebounce } from "@vueuse/core";
import FilterQueryInput from "./FilterQueryInput.vue";
import EditSideForm from "./EditSideForm.vue";
import OrbatSideGroup from "./OrbatSideGroup.vue";
import { NSide, NSideGroup, NUnit } from "@/types/internalModels";
import { ScenarioState } from "@/scenariostore/newScenarioStore";
import { DropTarget, MenuItemData } from "./types";
import { activeScenarioKey } from "@/components/injects";
import { injectStrict } from "@/utils";

interface Props {
  side: NSide;
  state: ScenarioState;
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
    target: DropTarget
  ): void;

  (e: "side-action", unit: NSide, action: SideAction): void;
}

const emit = defineEmits<Emits>();

const { store, unitActions } = injectStrict(activeScenarioKey);

const hasLocationFilter = ref(false);
const filterQuery = ref("");
const showFilter = ref(false);

const debouncedFilterQuery = useDebounce(filterQuery, 100);
const sideGroups = computed(() =>
  props.side.groups.map((id) => props.state.sideGroupMap[id])
);

const showEditSideForm = ref(false);

if (props.side._isNew) showEditSideForm.value = true;

const sideMenuItems: MenuItemData<SideAction>[] = [
  // { label: "Expand", action: SideActions.Expand },
  { label: "Edit", action: SideActions.Edit },
  { label: "Add group", action: SideActions.AddGroup },
  { label: "Delete side", action: SideActions.Delete },
  { label: "Move up", action: SideActions.MoveUp },
  { label: "Move down", action: SideActions.MoveDown },
];

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
  }
}

const onUnitAction = (unit: NUnit, action: UnitAction) => {
  emit("unit-action", unit, action);
};

const onUnitDrop = (
  unit: NUnit,
  destinationUnit: NUnit | NSideGroup,
  target: DropTarget
) => emit("unit-drop", unit, destinationUnit, target);
</script>
