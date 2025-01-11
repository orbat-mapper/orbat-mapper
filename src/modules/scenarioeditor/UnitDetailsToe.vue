<script setup lang="ts">
import {
  EUnitEquipment,
  EUnitPersonnel,
  NUnit,
  NUnitEquipment,
  NUnitPersonnel,
  NUnitSupply,
  ToeMode,
} from "@/types/internalModels";
import { computed, ref, shallowRef, triggerRef, watch } from "vue";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { useLocalStorage } from "@vueuse/core";
import { useSelectedItems } from "@/stores/selectedStore";
import { EntityId } from "@/types/base";
import {
  useEquipmentEditStore,
  usePersonnelEditStore,
  useToeEditStore,
} from "@/stores/toeStore";
import type { StateAdd } from "@/types/scenarioModels";

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/vue";
import ToeGridHeader from "@/modules/scenarioeditor/ToeGridHeader.vue";
import {
  useUnitEquipmentTableStore,
  useUnitPersonnelTableStore,
} from "@/stores/tableStores";
import { createToeTableColumns, useToeEditableItems } from "@/composables/toeUtils";
import ToeGrid from "@/modules/grid/ToeGrid.vue";
import InlineFormWrapper from "@/modules/scenarioeditor/InlineFormWrapper.vue";
import ModifyUnitToeItemForm from "@/modules/scenarioeditor/ModifyUnitToeItemForm.vue";
import AddUnitToeItemForm from "@/modules/scenarioeditor/AddUnitToeItemForm.vue";
import { useUiStore } from "@/stores/uiStore";
import { storeToRefs } from "pinia";

interface Props {
  unit: NUnit;
  isLocked?: boolean;
}

const props = defineProps<Props>();

const {
  store: { state, onUndoRedo, groupUpdate },
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
const uiStore = useUiStore();
const unitEquipmentTableStore = useUnitEquipmentTableStore();
const unitPersonnelTableStore = useUnitPersonnelTableStore();

const { editedId: editedEquipmentId, selectedItems: selectedEquipment } =
  useToeEditableItems<EUnitEquipment>();

const { editedId: editedPersonnelId, selectedItems: selectedPersonnel } =
  useToeEditableItems<EUnitPersonnel>();

const equipmentEditStore = useEquipmentEditStore();
const personnelEditStore = usePersonnelEditStore();

const { isEditMode } = storeToRefs(equipmentEditStore);

const { selectedUnitIds } = useSelectedItems();
const isMultiMode = computed(() => selectedUnitIds.value.size > 1);

const addFormData = ref<NUnitEquipment | NUnitPersonnel>({ id: "", count: 1 });
const aggregatedEquipment = shallowRef<EUnitEquipment[]>([]);
const aggregatedPersonnel = shallowRef<EUnitPersonnel[]>([]);
const aggregatedPersonnelCount = computed(() =>
  aggregatedPersonnel.value.reduce((acc, e) => acc + (e.onHand ?? e.count ?? 0), 0),
);

const equipmentColumns = createToeTableColumns();
const personnelColumns = createToeTableColumns();

onUndoRedo((param) => {
  // Update the current state of the selected units in case equipment or personnel have changed
  selectedUnitIds.value.forEach((unitId) => updateUnitState(unitId));
  triggerRef(selectedUnitIds);
});

let prevIncludeSubordinates: boolean | undefined;
watch(isEditMode, (value) => {
  if (value) {
    prevIncludeSubordinates = includeSubordinates.value;
    includeSubordinates.value = false;
  } else {
    if (prevIncludeSubordinates !== undefined) {
      includeSubordinates.value = prevIncludeSubordinates;
    }
  }
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

function onAddSubmit(toeMode: ToeMode, formData: NUnitSupply) {
  const { id, count, onHand } = formData;
  groupUpdate(() => {
    selectedUnitIds.value.forEach((unitId) => {
      if (toeMode === "equipment") {
        updateUnitEquipment(unitId, id, { count, onHand });
      } else if (toeMode === "personnel") {
        updateUnitPersonnel(unitId, id, { count, onHand });
      }
    });
  });
  triggerRef(selectedUnitIds);

  addFormData.value = { ...formData, id: "" };
}

function updateItemCount(
  toeMode: ToeMode,
  { id: itemId, count }: NUnitEquipment | NUnitPersonnel,
) {
  groupUpdate(() => {
    selectedUnitIds.value.forEach((unitId) => {
      if (toeMode === "equipment") {
        updateUnitEquipment(unitId, itemId, { count });
      } else if (toeMode === "personnel") {
        updateUnitPersonnel(unitId, itemId, { count });
      }
    });
  });
  triggerRef(selectedUnitIds);
  handleNextEditedId(toeMode, itemId);
}

function updateItemOnHand(
  toeMode: ToeMode,
  { id: itemId, onHand }: NUnitEquipment | NUnitPersonnel,
) {
  groupUpdate(() => {
    selectedUnitIds.value.forEach((unitId) => {
      if (toeMode === "equipment") {
        const unit = unitMap[unitId];
        if (!unit.equipment?.find((e) => e.id === itemId)) return;
        const newState: StateAdd = {
          t: +time.scenarioTime.value,
          update: { equipment: [{ id: itemId, onHand }] },
        };
        addUnitStateEntry(unitId, newState, true);
      } else if (toeMode === "personnel") {
        const unit = unitMap[unitId];
        if (!unit.personnel?.find((p) => p.id === itemId)) return;
        const newState: StateAdd = {
          t: +time.scenarioTime.value,
          update: { personnel: [{ id: itemId, onHand }] },
        };
        addUnitStateEntry(unitId, newState, true);
      }
    });
  });
  triggerRef(selectedUnitIds);
  handleNextEditedId(toeMode, itemId);
}

function diffItemOnHand(
  toeMode: ToeMode,
  { id: itemId, onHand }: NUnitEquipment | NUnitPersonnel,
) {
  groupUpdate(() => {
    selectedUnitIds.value.forEach((unitId) => {
      if (toeMode === "equipment") {
        const unit = unitMap[unitId];
        if (!unit.equipment?.find((e) => e.id === itemId)) return;
        const newState: StateAdd = {
          t: +time.scenarioTime.value,
          diff: { equipment: [{ id: itemId, onHand }] },
        };
        addUnitStateEntry(unitId, newState, true);
      } else if (toeMode === "personnel") {
        const unit = unitMap[unitId];
        if (!unit.personnel?.find((p) => p.id === itemId)) return;
        const newState: StateAdd = {
          t: +time.scenarioTime.value,
          diff: { personnel: [{ id: itemId, onHand }] },
        };
        addUnitStateEntry(unitId, newState, true);
      }
    });
  });
  triggerRef(selectedUnitIds);
  handleNextEditedId(toeMode, itemId);
}

function onDeleteItems(toeMode: ToeMode) {
  groupUpdate(() => {
    selectedUnitIds.value.forEach((unitId) => {
      if (toeMode === "equipment") {
        selectedEquipment.value.forEach(({ id: itemId }) => {
          updateUnitEquipment(unitId, itemId, { count: -1 });
        });
        selectedEquipment.value = [];
      } else if (toeMode === "personnel") {
        selectedPersonnel.value.forEach(({ id: itemId }) => {
          updateUnitPersonnel(unitId, itemId, { count: -1 });
        });
        selectedPersonnel.value = [];
      }
    });
  });
  triggerRef(selectedUnitIds);
}

function handleNextEditedId(mode: ToeMode, itemId: string) {
  if (!uiStore.goToNextOnSubmit) {
    if (mode === "equipment") {
      editedEquipmentId.value = null;
    } else if (mode === "personnel") {
      editedPersonnelId.value = null;
    }
    return;
  }
  if (mode === "equipment") {
    const currentIndex = aggregatedEquipment.value.findIndex((e) => e.id === itemId);
    if (currentIndex < aggregatedEquipment.value.length - 1) {
      editedEquipmentId.value = aggregatedEquipment.value[currentIndex + 1].id;
    } else {
      editedEquipmentId.value = null;
    }
  } else if (mode === "personnel") {
    const currentIndex = aggregatedPersonnel.value.findIndex((p) => p.id === itemId);
    if (currentIndex < aggregatedPersonnel.value.length - 1) {
      editedPersonnelId.value = aggregatedPersonnel.value[currentIndex + 1].id;
    } else {
      editedPersonnelId.value = null;
    }
  }
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
          v-model:editMode="isEditMode"
          v-model:addMode="equipmentEditStore.showAddForm"
          v-model:includeSubordinates="includeSubordinates"
          :selectedCount="selectedEquipment.length"
          @delete="onDeleteItems('equipment')"
          :isLocked="isLocked"
        />
        <AddUnitToeItemForm
          v-if="equipmentEditStore.showAddForm"
          mode="equipment"
          :usedItems="isMultiMode ? [] : aggregatedEquipment"
          @cancel="equipmentEditStore.showAddForm = false"
          @submit="onAddSubmit('equipment', $event)"
        />
        <ToeGrid
          v-if="aggregatedEquipment.length"
          :columns="equipmentColumns"
          :data="aggregatedEquipment"
          :tableStore="unitEquipmentTableStore"
          v-model:editMode="isEditMode"
          v-model:editedId="editedEquipmentId"
          :select="isEditMode"
          v-model:selected="selectedEquipment"
          :isLocked="isLocked"
        >
          <template #inline-form="{ row }">
            <InlineFormWrapper class="pr-6" details-panel>
              <ModifyUnitToeItemForm
                :itemData="row"
                :heading="row.name"
                :editStore="equipmentEditStore"
                @cancel="isEditMode = false"
                @updateCount="updateItemCount('equipment', $event)"
                @updateOnHand="updateItemOnHand('equipment', $event)"
                @diffOnHand="diffItemOnHand('equipment', $event)"
              />
            </InlineFormWrapper>
          </template>
        </ToeGrid>
      </TabPanel>
      <TabPanel :unmount="false">
        <ToeGridHeader
          v-model:editMode="isEditMode"
          v-model:addMode="personnelEditStore.showAddForm"
          v-model:includeSubordinates="includeSubordinates"
          :selectedCount="selectedPersonnel.length"
          @delete="onDeleteItems('personnel')"
          :isLocked="isLocked"
        />
        <AddUnitToeItemForm
          v-if="personnelEditStore.showAddForm"
          mode="personnel"
          :usedItems="isMultiMode ? [] : aggregatedPersonnel"
          @cancel="personnelEditStore.showAddForm = false"
          @submit="onAddSubmit('personnel', $event)"
          @delete="onDeleteItems('personnel')"
        />

        <ToeGrid
          v-if="aggregatedPersonnel.length"
          :columns="personnelColumns"
          :data="aggregatedPersonnel"
          :tableStore="unitPersonnelTableStore"
          :select="isEditMode"
          v-model:editMode="isEditMode"
          v-model:editedId="editedPersonnelId"
          v-model:selected="selectedPersonnel"
          :isLocked="isLocked"
        >
          <template #inline-form="{ row }">
            <InlineFormWrapper class="pr-6" details-panel>
              <ModifyUnitToeItemForm
                :itemData="row"
                :heading="row.name"
                @cancel="isEditMode = false"
                :editStore="personnelEditStore"
                @updateCount="updateItemCount('personnel', $event)"
                @updateOnHand="updateItemOnHand('personnel', $event)"
                @diffOnHand="diffItemOnHand('personnel', $event)"
              />
            </InlineFormWrapper>
          </template>
        </ToeGrid>
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
