<script setup lang="ts">
import { EUnitEquipment, EUnitPersonnel, NUnit } from "@/types/internalModels";
import { computed, shallowRef, triggerRef, watch } from "vue";
import { injectStrict, sortBy } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { useLocalStorage, useToggle } from "@vueuse/core";
import { useSelectedItems } from "@/stores/selectedStore";
import { EntityId } from "@/types/base";
import { useToeActions } from "@/composables/scenarioActions";
import { storeToRefs } from "pinia";
import {
  useEquipmentEditStore,
  usePersonnelEditStore,
  useToeEditStore,
} from "@/stores/toeStore";
import { useTimeFormatStore } from "@/stores/timeFormatStore";
import type { StateAdd } from "@/types/scenarioModels";

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/vue";
import ToeGridHeader from "@/modules/scenarioeditor/ToeGridHeader.vue";
import {
  useUnitEquipmentTableStore,
  useUnitPersonnelTableStore,
} from "@/stores/tableStores";
import { createToeTableColumns, useToeEditableItems } from "@/composables/toeUtils";
import ToeGrid from "@/modules/grid/ToeGrid.vue";

interface Props {
  unit: NUnit;
  isLocked?: boolean;
}

const props = defineProps<Props>();

const {
  store: { state, onUndoRedo },
  unitActions: {
    walkSubUnits,
    updateUnitEquipment,
    updateUnitPersonnel,
    updateUnitState,
    addUnitStateEntry,
  },
  time,
} = injectStrict(activeScenarioKey);

const { equipmentMap, personnelMap, unitMap } = state;

const includeSubordinates = useLocalStorage("includeSubordinates", true);
let prevIncludeSubordinates: boolean | undefined;
const toeEditStore = useToeEditStore();
const unitEquipmentTableStore = useUnitEquipmentTableStore();
const unitPersonnelTableStore = useUnitPersonnelTableStore();

const {
  editedId: editedEquipmentId,
  showAddForm: showAddEquipmentNew,
  selectedItems: selectedEquipment,
} = useToeEditableItems<EUnitEquipment>();

const {
  editedId: editedPersonnelId,
  showAddForm: showAddPersonnelNew,
  selectedItems: selectedPersonnel,
} = useToeEditableItems<EUnitPersonnel>();

const equipmentEditStore = useEquipmentEditStore();
const personnelEditStore = usePersonnelEditStore();

const { isToeEditMode, toeEditMode, changeMode } = storeToRefs(toeEditStore);

const fmt = useTimeFormatStore();
const { selectedUnitIds } = useSelectedItems();
const toeActions = useToeActions();
const isMultiMode = computed(() => selectedUnitIds.value.size > 1);

const aggregatedEquipment = shallowRef<EUnitEquipment[]>([]);
const aggregatedPersonnel = shallowRef<EUnitPersonnel[]>([]);
const aggregatedPersonnelCount = computed(() =>
  aggregatedPersonnel.value.reduce((acc, e) => acc + (e.onHand ?? e.count ?? 0), 0),
);

const equipmentColumns = createToeTableColumns();
const personnelColumns = createToeTableColumns();

const personnelValues = computed(() => {
  return sortBy(Object.values(personnelMap), "name");
});

const [showAddPersonnel, toggleAddPersonnel] = useToggle(false);

onUndoRedo((param) => {
  // Update the current state of the selected units in case equipment or personnel have changed
  selectedUnitIds.value.forEach((unitId) => updateUnitState(unitId));
  triggerRef(selectedUnitIds);
});

watch(
  [
    selectedUnitIds,
    includeSubordinates,
    time.scenarioTime,
    () => state.settingsStateCounter,
  ],
  () => {
    const aggEquipment: Record<string, { count: number; onHand: number }> = {};
    const aggPersonnel: Record<string, { count: number; onHand: number }> = {};
    const allUnitIds = new Set<EntityId>();
    selectedUnitIds.value.forEach((unitId) => {
      if (includeSubordinates.value) {
        walkSubUnits(
          unitId,
          (unit) => {
            allUnitIds.add(unit.id);
          },
          { includeParent: true },
        );
      } else {
        allUnitIds.add(unitId);
      }
    });
    allUnitIds.forEach((unitId) => {
      const unit = unitMap[unitId];
      const equipment = unit._state?.equipment ?? unit.equipment ?? [];
      const personnel = unit._state?.personnel ?? unit.personnel ?? [];
      equipment?.forEach((e) => {
        const count = (aggEquipment[e.id]?.count ?? 0) + e.count;
        const onHand = (aggEquipment[e.id]?.onHand ?? 0) + (e?.onHand ?? e.count);
        aggEquipment[e.id] = { count, onHand };
      });
      personnel?.forEach((p) => {
        const count = (aggPersonnel[p.id]?.count ?? 0) + p.count;
        const onHand = (aggPersonnel[p.id]?.onHand ?? 0) + (p?.onHand ?? p.count);
        aggPersonnel[p.id] = { count, onHand };
      });
    });

    aggregatedEquipment.value = Object.entries(aggEquipment).map(
      ([id, { count, onHand }]) => ({
        id,
        name: equipmentMap[id]?.name ?? id,
        description: equipmentMap[id]?.description ?? "",
        count,
        onHand,
      }),
    );
    aggregatedPersonnel.value = Object.entries(aggPersonnel).map(
      ([id, { count, onHand }]) => ({
        id,
        name: personnelMap[id]?.name ?? id,
        description: personnelMap[id]?.description ?? "",
        count,
        onHand,
      }),
    );
  },
  { immediate: true, deep: true },
);

function updateEquipment(
  equipmentId: string,
  { count, onHand }: { count: number; onHand?: number },
) {
  if (toeEditMode.value === "onHand") {
    const newState: StateAdd = {
      t: +time.scenarioTime.value,
      update: { equipment: [{ id: equipmentId, onHand }] },
    };
    addUnitStateEntry(props.unit.id, newState, true);
  } else {
    updateUnitEquipment(props.unit.id, equipmentId, { count });
  }
  triggerRef(selectedUnitIds);
}

function addEquipment(
  equipmentId: string,
  { count, onHand }: { count: number; onHand?: number },
) {
  updateUnitEquipment(props.unit.id, equipmentId, { count, onHand });
  triggerRef(selectedUnitIds);
}

function diffEquipment(equipmentId: string, { onHand }: { onHand: number }) {
  if (toeEditMode.value === "onHand") {
    const newState: StateAdd = {
      t: +time.scenarioTime.value,
      diff: { equipment: [{ id: equipmentId, onHand }] },
    };
    addUnitStateEntry(props.unit.id, newState, true);
  }
  triggerRef(selectedUnitIds);
}

function updatePersonnel(
  personnelId: string,
  { count, onHand }: { count: number; onHand?: number },
) {
  if (toeEditMode.value === "onHand") {
    const newState: StateAdd = {
      t: +time.scenarioTime.value,
      update: { personnel: [{ id: personnelId, onHand }] },
    };
    addUnitStateEntry(props.unit.id, newState, true);
  } else {
    updateUnitPersonnel(props.unit.id, personnelId, { count });
  }
  triggerRef(selectedUnitIds);
}

function addPersonnel(
  personnelId: string,
  { count, onHand }: { count: number; onHand?: number },
) {
  updateUnitPersonnel(props.unit.id, personnelId, { count, onHand });
  triggerRef(selectedUnitIds);
}

function diffPersonnel(personnelId: string, { onHand }: { onHand: number }) {
  if (toeEditMode.value === "onHand") {
    const newState: StateAdd = {
      t: +time.scenarioTime.value,
      diff: { personnel: [{ id: personnelId, onHand }] },
    };
    addUnitStateEntry(props.unit.id, newState, true);
  }
  triggerRef(selectedUnitIds);
}

function deleteEquipment(equipmentId: string) {
  updateUnitEquipment(props.unit.id, equipmentId, { count: -1 });
  triggerRef(selectedUnitIds);
}

function deletePersonnel(personnelId: string) {
  updateUnitPersonnel(props.unit.id, personnelId, { count: -1 });
  triggerRef(selectedUnitIds);
}
</script>

<template>
  <TabGroup>
    <TabList class="-mx-4 flex items-center border-b bg-gray-100 p-2 px-4">
      <Tab
        v-for="lbl in ['Equipment', 'Personnel']"
        :key="lbl"
        v-slot="{ selected }"
        as="template"
        ><button
          type="button"
          :class="[
            selected ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:text-gray-800',
            'w-full rounded-md px-3 py-2 text-sm font-medium',
          ]"
        >
          {{ lbl }}
        </button></Tab
      >
    </TabList>
    <TabPanels>
      <TabPanel :unmount="false">
        <ToeGridHeader
          v-model:editMode="equipmentEditStore.isEditMode"
          v-model:addMode="equipmentEditStore.showAddForm"
          v-model:includeSubordinates="includeSubordinates"
          :selectedCount="selectedEquipment.length"
        />
        <ToeGrid
          :columns="equipmentColumns"
          :data="aggregatedEquipment"
          :tableStore="unitEquipmentTableStore"
          v-model:editMode="equipmentEditStore.isEditMode"
          :select="equipmentEditStore.isEditMode"
          v-model:selected="selectedEquipment"
        />
      </TabPanel>
      <TabPanel :unmount="false">
        <ToeGridHeader
          v-model:editMode="equipmentEditStore.isEditMode"
          v-model:addMode="personnelEditStore.showAddForm"
          v-model:includeSubordinates="includeSubordinates"
          :selectedCount="selectedPersonnel.length"
        />
        <ToeGrid
          :columns="personnelColumns"
          :data="aggregatedPersonnel"
          :tableStore="unitPersonnelTableStore"
          v-model:editMode="equipmentEditStore.isEditMode"
          :select="personnelEditStore.isEditMode"
          v-model:selected="selectedPersonnel"
        />
      </TabPanel>
      <TabPanel>Content 3</TabPanel>
    </TabPanels>
  </TabGroup>

  <div class="prose p-1 dark:prose-invert">
    <p v-if="!aggregatedEquipment.length && !aggregatedPersonnel.length">
      <span v-if="includeSubordinates"
        >No data about equipment or personnel available</span
      ><span v-else>This unit does not have any equipment or personnel</span>.
    </p>
  </div>
</template>
