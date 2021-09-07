<template>
  <Disclosure v-slot="{ open }" default-open>
    <section class="pl-6">
      <header
        class="
          flex
          items-center
          justify-between
          relative
          block
          -ml-6
          pl-6
          bg-gray-200
          border-b-2 border-t-2
          py-1
          border-gray-300
        "
      >
        <DisclosureButton
          class="w-full text-left flex items-center justify-between"
        >
          <h4 class="font-medium text-base text-gray-900">{{ side.name }}</h4>
          <ChevronUpIcon
            :class="open ? 'transform rotate-180' : ''"
            class="w-6 h-6 text-gray-400 group-hover:text-gray-900"
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
<script lang="ts">
import DotsMenu, { MenuItemData } from "./DotsMenu.vue";
import OrbatTree from "./OrbatTree.vue";
import { defineComponent, onBeforeUpdate, PropType, ref } from "vue";
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/vue";
import { ChevronUpIcon } from "@heroicons/vue/solid";
import { Side } from "../types/models";
import { SideActions } from "../types/constants";
import { useScenarioStore } from "../stores/scenarioStore";
import InputGroup from "./InputGroup.vue";
import { useDebounce, useToggle } from "@vueuse/core";
import FilterQueryInput from "./FilterQueryInput.vue";
import PlainButton from "./PlainButton.vue";
import EditSideForm from "./EditSideForm.vue";
import SecondaryButton from "./SecondaryButton.vue";
import OrbatSideGroup from "./OrbatSideGroup.vue";
import { useUnitManipulationStore } from "../stores/scenarioManipulation";

export default defineComponent({
  name: "OrbatSide",
  components: {
    OrbatSideGroup,
    SecondaryButton,
    EditSideForm,
    PlainButton,
    FilterQueryInput,
    InputGroup,
    DotsMenu,
    OrbatTree,
    Disclosure,
    DisclosureButton,
    DisclosurePanel,
    ChevronUpIcon,
  },
  props: {
    side: { type: Object as PropType<Side>, required: true },
  },
  setup(props) {
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
    const toggleLocationFilter = useToggle(hasLocationFilter);

    const filterQuery = ref("");
    const debouncedFilterQuery = useDebounce(filterQuery, 100);

    const setItemRef = (el: any) => {
      if (el) treeRefs.push(el);
    };

    return {
      sideMenuItems,
      onSideAction,
      treeRef,
      filterQuery,
      debouncedFilterQuery,
      hasLocationFilter,
      toggleLocationFilter,
      setItemRef,
      showEditSideForm,
    };
  },
});
</script>
