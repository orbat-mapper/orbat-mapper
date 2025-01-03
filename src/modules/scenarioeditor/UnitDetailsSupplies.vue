<script setup lang="ts">
import {
  EUnitSupply,
  NSupplyCategory,
  NSupplyClass,
  NUnit,
  NUnitSupply,
} from "@/types/internalModels";
import { computed, ref, shallowRef, triggerRef, watch } from "vue";
import { injectStrict, sortBy } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { useLocalStorage, useToggle } from "@vueuse/core";
import { useSelectedItems } from "@/stores/selectedStore";
import { EntityId } from "@/types/base";
import { useToeActions } from "@/composables/scenarioActions";
import ToggleField from "@/components/ToggleField.vue";
import { storeToRefs } from "pinia";
import { useSuppliesEditStore } from "@/stores/toeStore";
import { useTimeFormatStore } from "@/stores/timeFormatStore";
import type { StateAdd } from "@/types/scenarioModels";
import { useToeEditableItems } from "@/composables/toeUtils";

import ToeGrid from "@/modules/grid/ToeGrid.vue";
import ToeGridHeader from "@/modules/scenarioeditor/ToeGridHeader.vue";
import { ColumnDef } from "@tanstack/vue-table";
import AddSupplyUoMForm from "@/modules/scenarioeditor/AddSupplyUoMForm.vue";
import AddUnitSupplyForm from "@/modules/scenarioeditor/AddUnitSupplyForm.vue";

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
  rerender,
  selectedItems: selectedSupplies,
} = useToeEditableItems<EUnitSupply>();

const includeSubordinates = useLocalStorage("includeSubordinates", true);
let prevIncludeSubordinates: boolean | undefined;
const suppliesEditStore = useSuppliesEditStore();

const { isSuppliesEditMode, suppliesEditMode, changeMode } =
  storeToRefs(suppliesEditStore);

const fmt = useTimeFormatStore();
const { selectedUnitIds } = useSelectedItems();

const isMultiMode = computed(() => selectedUnitIds.value.size > 1);

const aggregatedSupplies = shallowRef<EUnitSupply[]>([]);

function asPercent(item: EUnitSupply) {
  return Math.floor(((item.onHand ?? 1) / item.count) * 100) + "%";
}

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

const supplyCategoryValues = computed(() => {
  return sortBy(Object.values(supplyCategoryMap), "name");
});

const [showAddSupplies, toggleAddSupplies] = useToggle(false);

const formattedTime = computed(() =>
  fmt.scenarioFormatter.format(+time.scenarioTime.value),
);

onUndoRedo((param) => {
  // Update the current state of the selected units in case equipment or personnel have changed
  selectedUnitIds.value.forEach((unitId) => updateUnitState(unitId));
  triggerRef(selectedUnitIds);
});

watch(isSuppliesEditMode, (isEditMode) => {
  if (isEditMode) {
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

function updateSupply(
  supplyId: string,
  { count, onHand }: { count: number; onHand?: number },
) {
  if (suppliesEditMode.value === "onHand") {
    const newState: StateAdd = {
      t: +time.scenarioTime.value,
      update: { supplies: [{ id: supplyId, onHand }] },
    };
    addUnitStateEntry(props.unit.id, newState, true);
  } else {
    updateUnitSupply(props.unit.id, supplyId, { count });
  }
  triggerRef(selectedUnitIds);
}

function addSupply(
  unitId: string,
  supplyId: string,
  { count, onHand }: { count: number; onHand?: number },
) {
  updateUnitSupply(unitId, supplyId, { count, onHand });
  triggerRef(selectedUnitIds);
}

function diffSupply(supplyId: string, { onHand }: { onHand: number }) {
  if (suppliesEditMode.value === "onHand") {
    const newState: StateAdd = {
      t: +time.scenarioTime.value,
      diff: { supplies: [{ id: supplyId, onHand }] },
    };
    addUnitStateEntry(props.unit.id, newState, true);
  }
  triggerRef(selectedUnitIds);
}

function deleteSupply(unitId: string, supplyId: string) {
  updateUnitSupply(unitId, supplyId, { count: -1 });
  triggerRef(selectedUnitIds);
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
  selectedSupplies.value = [];
}
</script>

<template>
  <div class="mt-4 flex items-center justify-between">
    <p class="text-sm">Unit supplies</p>
    <ToggleField v-model="includeSubordinates" :disabled="isSuppliesEditMode"
      >Include subordinates
    </ToggleField>
  </div>

  <div class="">
    <ToeGridHeader
      v-model:editMode="isSuppliesEditMode"
      v-model:addMode="showAddForm"
      editLabel="Edit supplies"
      :selectedCount="selectedSupplies.length"
      @delete="onDelete"
    />
    <AddUnitSupplyForm
      v-if="showAddForm"
      @cancel="showAddForm = false"
      :usedSupplies="isMultiMode ? [] : aggregatedSupplies"
      v-model:form="addFormData"
      @submit="onAddSubmit"
    />

    <ToeGrid
      :columns="columns"
      :data="aggregatedSupplies"
      v-model:editedId="editedId"
      :select="isSuppliesEditMode"
      v-model:selected="selectedSupplies"
      v-model:editMode="isSuppliesEditMode"
    />
  </div>
</template>
