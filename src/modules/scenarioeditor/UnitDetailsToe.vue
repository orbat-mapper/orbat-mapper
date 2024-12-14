<script setup lang="ts">
import { EUnitEquipment, EUnitPersonnel, NUnit } from "@/types/internalModels";
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
import { useToeEditStore } from "@/stores/toeStore";
import { useTimeFormatStore } from "@/stores/timeFormatStore";
import type { StateAdd } from "@/types/scenarioModels";

interface Props {
  unit: NUnit;
  isLocked?: boolean;
}

const props = defineProps<Props>();

const {
  store: {
    state: { equipmentMap, personnelMap, unitMap },
    onUndoRedo,
  },
  unitActions: {
    walkSubUnits,
    updateUnitEquipment,
    updateUnitPersonnel,
    updateUnitState,
    addUnitStateEntry,
  },
  time,
} = injectStrict(activeScenarioKey);

const includeSubordinates = useLocalStorage("includeSubordinates", true);
let prevIncludeSubordinates: boolean | undefined;
const toeEditStore = useToeEditStore();

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

const aggregatedEquipmentCount = computed(() =>
  aggregatedEquipment.value.reduce((acc, e) => acc + (e.onHand ?? e.count ?? 0), 0),
);
const equipmentValues = computed(() => {
  return sortBy(Object.values(equipmentMap), "name");
});
const personnelValues = computed(() => {
  return sortBy(Object.values(personnelMap), "name");
});

const [showAddEquipment, toggleAddEquipment] = useToggle(false);
const [showAddPersonnel, toggleAddPersonnel] = useToggle(false);

const formattedTime = computed(() =>
  fmt.scenarioFormatter.format(+time.scenarioTime.value),
);

onUndoRedo((param) => {
  // Update the current state of the selected units in case equipment or personnel have changed
  selectedUnitIds.value.forEach((unitId) => updateUnitState(unitId));
  triggerRef(selectedUnitIds);
});

watch(isToeEditMode, (isEditMode) => {
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
  <div class="mt-4 flex justify-between">
    <div>
      <PrimaryButton @click="toeEditStore.toggleEditToeMode()"
        ><span v-if="isToeEditMode">Done editing</span
        ><span v-else>Edit TO&E</span></PrimaryButton
      >
    </div>
    <ToggleField v-model="includeSubordinates" :disabled="isToeEditMode"
      >Include subordinates
    </ToggleField>
  </div>
  <p class="mt-4 text-sm text-muted-foreground" v-if="isToeEditMode">
    Double click on table rows to start editing.
  </p>
  <div class="prose p-1 dark:prose-invert">
    <AccordionPanel :label="`Equipment (${aggregatedEquipmentCount})`" defaultOpen>
      <div v-if="isToeEditMode" class="flex justify-end">
        <BaseButton
          small
          :disabled="isMultiMode || isLocked"
          @click="toggleAddEquipment()"
          >{{ showAddEquipment ? "Hide form" : "+ Add" }}
        </BaseButton>
      </div>
      <p v-if="showAddEquipment" class="mt-2 text-right">
        <button
          type="button"
          class="btn-link"
          @click="toeActions.goToAddEquipment()"
          :disabled="isLocked"
        >
          + Add new equipment type
        </button>
      </p>
      <UnitToeItemTable
        :items="aggregatedEquipment"
        :is-multi-mode="isMultiMode"
        :is-locked="isLocked"
        :values="equipmentValues"
        @update="updateEquipment"
        @diff="diffEquipment"
        @add="addEquipment"
        @delete="deleteEquipment"
        v-model:show-add="showAddEquipment"
      />
    </AccordionPanel>

    <AccordionPanel :label="`Personnel (${aggregatedPersonnelCount})`" defaultOpen>
      <div class="flex justify-end" v-if="isToeEditMode">
        <BaseButton
          small
          :disabled="isMultiMode || isLocked"
          @click="toggleAddPersonnel()"
          >{{ showAddPersonnel ? "Hide form" : "+ Add" }}
        </BaseButton>
      </div>
      <p v-if="isToeEditMode && showAddPersonnel" class="mt-2 text-right">
        <button
          type="button"
          class="btn-link"
          @click="toeActions.goToAddPersonnel()"
          :disabled="isLocked"
        >
          + Add new personnel category
        </button>
      </p>
      <UnitToeItemTable
        :items="aggregatedPersonnel"
        :is-multi-mode="isMultiMode"
        :values="personnelValues"
        @update="updatePersonnel"
        @add="addPersonnel"
        @delete="deletePersonnel"
        @diff="diffPersonnel"
        v-model:show-add="showAddPersonnel"
      />
    </AccordionPanel>

    <p v-if="!aggregatedEquipment.length && !aggregatedPersonnel.length">
      <span v-if="includeSubordinates"
        >No data about equipment or personnel available</span
      ><span v-else>This unit does not have any equipment or personnel</span>.
    </p>
  </div>
</template>
