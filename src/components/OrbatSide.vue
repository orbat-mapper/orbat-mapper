<template>
  <Disclosure v-slot="{ open }" default-open>
    <section class="pl-6">
      <header
        class="relative -ml-6 block flex items-center justify-between border-b-2 border-t-2 border-gray-300 bg-gray-200 py-1 pl-6"
      >
        <DisclosureButton class="flex w-full items-center justify-between text-left">
          <h4 class="text-base font-medium text-gray-900">{{ side.name }}</h4>
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
        <div v-for="group in side.groups" :key="group.id">
          <OrbatSideGroup
            :group="group"
            :filter-query="debouncedFilterQuery"
            :has-location-filter="hasLocationFilter"
          >
          </OrbatSideGroup>
        </div>
      </DisclosurePanel>
    </section>
  </Disclosure>
</template>

<script setup lang="ts">
import DotsMenu, { MenuItemData } from "./DotsMenu.vue";
import OrbatTree from "./OrbatTree.vue";
import { onBeforeUpdate, ref } from "vue";
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/vue";
import { ChevronUpIcon } from "@heroicons/vue/solid";
import { Side } from "../types/scenarioModels";
import { SideActions } from "../types/constants";
import { useScenarioStore } from "../stores/scenarioStore";
import { useDebounce } from "@vueuse/core";
import FilterQueryInput from "./FilterQueryInput.vue";
import EditSideForm from "./EditSideForm.vue";
import OrbatSideGroup from "./OrbatSideGroup.vue";
import { useUnitManipulationStore } from "../stores/scenarioManipulation";

const props = defineProps<{ side: Side }>();
let treeRef = ref<InstanceType<typeof OrbatTree>>();
let treeRefs: InstanceType<typeof OrbatTree>[] = [];
const scenarioStore = useScenarioStore();
const unitManipulationStore = useUnitManipulationStore();
const showEditSideForm = ref(false);
if (props.side._isNew) showEditSideForm.value = true;

const sideMenuItems: MenuItemData<SideActions>[] = [
  // { label: "Expand", action: SideActions.Expand },
  { label: "Edit", action: SideActions.Edit },
  // { label: "Add root unit", action: SideActions.AddSubordinate },
  { label: "Add group", action: SideActions.AddGroup },
];

onBeforeUpdate(() => {
  treeRefs = [];
});

const onSideAction = (action: SideActions) => {
  if (action === SideActions.Expand) {
    treeRefs.forEach((tree) => tree?.expandChildren());
  } else if (action === SideActions.AddSubordinate) {
    unitManipulationStore.createSubordinateUnit(props.side.groups[0]);
  } else if (action === SideActions.AddGroup) {
    scenarioStore.addSideGroup(props.side);
  } else if (action === SideActions.Edit) {
    showEditSideForm.value = true;
  }
};

const hasLocationFilter = ref(false);

const filterQuery = ref("");
const debouncedFilterQuery = useDebounce(filterQuery, 100);

const setItemRef = (el: any) => {
  if (el) treeRefs.push(el);
};
</script>
