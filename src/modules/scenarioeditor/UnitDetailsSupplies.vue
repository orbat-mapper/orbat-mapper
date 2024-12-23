<script setup lang="ts">
import {
  EUnitEquipment,
  EUnitPersonnel,
  EUnitSupply,
  NUnit,
} from "@/types/internalModels";
import { computed, shallowRef, triggerRef, watch } from "vue";
import { injectStrict, sortBy } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { useLocalStorage, useToggle } from "@vueuse/core";
import { useSelectedItems } from "@/stores/selectedStore";
import { EntityId } from "@/types/base";
import BaseButton from "@/components/BaseButton.vue";
import UnitToeItemTable from "@/modules/scenarioeditor/UnitToeItemTable.vue";
import { useToeActions } from "@/composables/scenarioActions";
import ToggleField from "@/components/ToggleField.vue";
import AccordionPanel from "@/components/AccordionPanel.vue";
import PrimaryButton from "@/components/PrimaryButton.vue";
import { storeToRefs } from "pinia";
import { useSuppliesEditStore, useToeEditStore } from "@/stores/toeStore";
import { useTimeFormatStore } from "@/stores/timeFormatStore";
import type { StateAdd } from "@/types/scenarioModels";
import UnitSupplyItemTable from "@/modules/scenarioeditor/UnitSupplyItemTable.vue";

interface Props {
  unit: NUnit;
  isLocked?: boolean;
}

const props = defineProps<Props>();

const {
  store: {
    state: { supplyCategoryMap, unitMap, supplyClassMap, supplyUomMap },
    onUndoRedo,
  },
  unitActions: { walkSubUnits, updateUnitSupply, updateUnitState, addUnitStateEntry },
  time,
} = injectStrict(activeScenarioKey);

const includeSubordinates = useLocalStorage("includeSubordinates", true);
let prevIncludeSubordinates: boolean | undefined;
const suppliesEditStore = useSuppliesEditStore();

const { isSuppliesEditMode, suppliesEditMode, changeMode } =
  storeToRefs(suppliesEditStore);

const fmt = useTimeFormatStore();
const { selectedUnitIds } = useSelectedItems();
const toeActions = useToeActions();
const isMultiMode = computed(() => selectedUnitIds.value.size > 1);

const aggregatedSupplies = shallowRef<EUnitSupply[]>([]);

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
  [selectedUnitIds, includeSubordinates, time.scenarioTime],
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
        const uom = supplyUomMap[sc?.uom ?? ""]?.name ?? "";
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
  supplyId: string,
  { count, onHand }: { count: number; onHand?: number },
) {
  updateUnitSupply(props.unit.id, supplyId, { count, onHand });
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

function deleteSupply(supplyId: string) {
  updateUnitSupply(props.unit.id, supplyId, { count: -1 });
  triggerRef(selectedUnitIds);
}
</script>

<template>
  <div class="mt-4 flex justify-between">
    <div>
      <PrimaryButton
        @click="suppliesEditStore.toggleEditSuppliesMode()"
        :disabled="isLocked"
        ><span v-if="isSuppliesEditMode">Done editing</span
        ><span v-else>Edit supplies</span></PrimaryButton
      >
    </div>
    <ToggleField v-model="includeSubordinates" :disabled="isSuppliesEditMode"
      >Include subordinates
    </ToggleField>
  </div>
  <p class="mt-4 text-sm text-muted-foreground" v-if="isSuppliesEditMode">
    Double click on table rows to start editing.
  </p>
  <div class="prose p-1 dark:prose-invert">
    <div v-if="isSuppliesEditMode" class="flex justify-end">
      <BaseButton small :disabled="isMultiMode || isLocked" @click="toggleAddSupplies()"
        >{{ showAddSupplies ? "Hide form" : "+ Add" }}
      </BaseButton>
    </div>
    <p v-if="showAddSupplies" class="mt-2 text-right">
      <button
        type="button"
        class="btn-link"
        @click="toeActions.goToAddEquipment()"
        :disabled="isLocked"
      >
        + Add new equipment type
      </button>
    </p>
    <UnitSupplyItemTable
      :items="aggregatedSupplies"
      :is-multi-mode="isMultiMode"
      :is-locked="isLocked"
      :values="supplyCategoryValues"
      @update="updateSupply"
      @diff="diffSupply"
      @add="addSupply"
      @delete="deleteSupply"
      v-model:show-add="showAddSupplies"
    />
  </div>
</template>
