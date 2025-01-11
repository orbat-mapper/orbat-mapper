<script setup lang="ts">
import { EUnitSupply, NUnit, NUnitSupply } from "@/types/internalModels";
import { computed, ref, shallowRef, triggerRef, watch } from "vue";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { useLocalStorage } from "@vueuse/core";
import { useSelectedItems } from "@/stores/selectedStore";
import { EntityId } from "@/types/base";
import ToggleField from "@/components/ToggleField.vue";
import { storeToRefs } from "pinia";
import { useSuppliesEditStore } from "@/stores/toeStore";
import type { StateAdd } from "@/types/scenarioModels";
import { asPercent, useToeEditableItems } from "@/composables/toeUtils";

import ToeGrid from "@/modules/grid/ToeGrid.vue";
import ToeGridHeader from "@/modules/scenarioeditor/ToeGridHeader.vue";
import { ColumnDef } from "@tanstack/vue-table";
import AddUnitSupplyForm from "@/modules/scenarioeditor/AddUnitSupplyForm.vue";
import InlineFormWrapper from "@/modules/scenarioeditor/InlineFormWrapper.vue";
import ModifyUnitSupplyForm from "@/modules/scenarioeditor/ModifyUnitSupplyForm.vue";
import { useUnitSupplyTableStore } from "@/stores/tableStores";
import { useUiStore } from "@/stores/uiStore";

interface Props {
  unit: NUnit;
  isLocked?: boolean;
}

const props = defineProps<Props>();

const {
  store: { state, onUndoRedo, groupUpdate },
  unitActions: { walkSubUnits, updateUnitSupply, updateUnitState, addUnitStateEntry },
  time,
} = injectStrict(activeScenarioKey);

const addFormData = ref<NUnitSupply>({ id: "", count: 1 });

const { unitMap, supplyCategoryMap, supplyClassMap, supplyUomMap } = state;

const {
  editedId,
  showAddForm,
  selectedItems: selectedSupplies,
} = useToeEditableItems<EUnitSupply>();

const includeSubordinates = useLocalStorage("includeSubordinates", true);
const suppliesEditStore = useSuppliesEditStore();

const { isSuppliesEditMode } = storeToRefs(suppliesEditStore);

const tableStore = useUnitSupplyTableStore();
const uiStore = useUiStore();

const { selectedUnitIds } = useSelectedItems();

const isMultiMode = computed(() => selectedUnitIds.value.size > 1);

const aggregatedSupplies = shallowRef<EUnitSupply[]>([]);

const columns: ColumnDef<EUnitSupply>[] = [
  { id: "name", header: "Name", accessorKey: "name", size: 100 },
  { id: "class", header: "Class", accessorKey: "supplyClass" },
  {
    id: "assigned",
    header: "Asgd.",
    accessorKey: "count",
    size: 80,
    meta: { align: "right" },
  },
  {
    id: "onHand",
    header: "Avail.",
    accessorKey: "onHand",
    size: 80,
    meta: { align: "right" },
  },
  { id: "uom", header: "Unit", accessorKey: "uom", size: 80 },
  {
    id: "percentage",
    header: "%",
    accessorFn: (f) => asPercent(f),
    size: 80,
    meta: { align: "right" },
  },
];

onUndoRedo((param) => {
  // Update the current state of the selected units in case equipment or personnel have changed
  selectedUnitIds.value.forEach((unitId) => updateUnitState(unitId));
  triggerRef(selectedUnitIds);
});

watch(isSuppliesEditMode, (isEditMode) => {
  if (isEditMode) {
    uiStore.prevToeIncludeSubordinates = includeSubordinates.value;
    includeSubordinates.value = false;
  } else {
    if (uiStore.prevToeIncludeSubordinates !== undefined) {
      includeSubordinates.value = uiStore.prevToeIncludeSubordinates;
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
    const aggSupplies: Record<string, { count: number; onHand: number }> = {};

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
      const supplies = unit._state?.supplies ?? unit.supplies ?? [];

      supplies.forEach((e) => {
        const count = (aggSupplies[e.id]?.count ?? 0) + e.count;
        const onHand = (aggSupplies[e.id]?.onHand ?? 0) + (e?.onHand ?? e.count);
        aggSupplies[e.id] = { count, onHand };
      });
    });

    aggregatedSupplies.value = Object.entries(aggSupplies).map(
      ([id, { count, onHand }]) => {
        const sc = supplyCategoryMap[id];
        const supplyClass = supplyClassMap[sc?.supplyClass ?? ""]?.name ?? "";
        const uomObj = supplyUomMap[sc?.uom ?? ""];
        const uom = uomObj?.code ?? uomObj?.name ?? "";
        return {
          id,
          name: sc?.name ?? id,
          description: sc?.description ?? "",
          supplyClass,
          count,
          onHand,
          uom,
        };
      },
    );
  },
  { immediate: true, deep: true },
);

function updateSupplyCount(supplyId: string, { count }: { count: number }) {
  groupUpdate(() => {
    selectedUnitIds.value.forEach((unitId) => {
      updateUnitSupply(unitId, supplyId, { count });
    });
  });

  triggerRef(selectedUnitIds);
  handleNextEditedId(supplyId);
}

function updateSupplyOnHand(supplyId: string, { onHand }: NUnitSupply) {
  groupUpdate(() => {
    selectedUnitIds.value.forEach((unitId) => {
      // skip units that don't have the supply
      const unit = unitMap[unitId];
      if (!unit.supplies?.find((e) => e.id === supplyId)) return;
      const newState: StateAdd = {
        t: +time.scenarioTime.value,
        update: { supplies: [{ id: supplyId, onHand }] },
      };
      addUnitStateEntry(unitId, newState, true);
    });
  });

  triggerRef(selectedUnitIds);
  handleNextEditedId(supplyId);
}

function addSupply(
  unitId: string,
  supplyId: string,
  { count, onHand }: { count: number; onHand?: number },
) {
  updateUnitSupply(unitId, supplyId, { count, onHand });
  triggerRef(selectedUnitIds);
}

function diffSupplyOnHand(supplyId: string, { onHand }: NUnitSupply) {
  groupUpdate(() => {
    selectedUnitIds.value.forEach((unitId) => {
      // skip units that don't have the supply
      const unit = unitMap[unitId];
      if (!unit.supplies?.find((e) => e.id === supplyId)) return;

      const newState: StateAdd = {
        t: +time.scenarioTime.value,
        diff: { supplies: [{ id: supplyId, onHand }] },
      };
      addUnitStateEntry(unitId, newState, true);
    });
  });

  triggerRef(selectedUnitIds);
  handleNextEditedId(supplyId);
}

function handleNextEditedId(supplyId: string) {
  if (uiStore.goToNextOnSubmit) {
    const currentIndex = aggregatedSupplies.value.findIndex((sc) => sc.id === supplyId);
    if (currentIndex < aggregatedSupplies.value.length - 1) {
      editedId.value = aggregatedSupplies.value[currentIndex + 1].id;
    } else {
      editedId.value = null;
    }
  } else {
    editedId.value = null;
  }
}

function deleteSupply(unitId: string, supplyId: string) {
  updateUnitSupply(unitId, supplyId, { count: -1 });
}

function onAddSubmit(formData: NUnitSupply) {
  const { id, count, onHand } = formData;
  groupUpdate(() => {
    selectedUnitIds.value.forEach((unitId) => {
      addSupply(unitId, id, { count, onHand });
    });
  });

  addFormData.value = { ...formData, id: "" };
}

function onDelete() {
  groupUpdate(() => {
    selectedUnitIds.value.forEach((unitId) => {
      selectedSupplies.value.forEach((e) => {
        deleteSupply(unitId, e.id);
      });
    });
  });
  triggerRef(selectedUnitIds);
  selectedSupplies.value = [];
}
</script>

<template>
  <div class="">
    <ToeGridHeader
      v-model:editMode="isSuppliesEditMode"
      v-model:addMode="showAddForm"
      v-model:includeSubordinates="includeSubordinates"
      :selectedCount="selectedSupplies.length"
      @delete="onDelete"
      :isLocked="isLocked"
    />
    <AddUnitSupplyForm
      v-if="showAddForm"
      @cancel="showAddForm = false"
      :usedSupplies="isMultiMode ? [] : aggregatedSupplies"
      v-model:form="addFormData"
      @submit="onAddSubmit"
    />

    <ToeGrid
      v-if="aggregatedSupplies.length"
      :columns="columns"
      :data="aggregatedSupplies"
      v-model:editedId="editedId"
      :select="isSuppliesEditMode"
      v-model:selected="selectedSupplies"
      v-model:editMode="isSuppliesEditMode"
      :tableStore="tableStore"
      :isLocked="isLocked"
    >
      <template #inline-form="{ row }">
        <InlineFormWrapper class="pr-6" details-panel>
          <ModifyUnitSupplyForm
            :itemData="row"
            :heading="row.name"
            @cancel="isSuppliesEditMode = false"
            @diffOnHand="diffSupplyOnHand"
            @updateCount="updateSupplyCount"
            @updateOnHand="updateSupplyOnHand"
          />
        </InlineFormWrapper>
      </template>
    </ToeGrid>
  </div>
</template>
