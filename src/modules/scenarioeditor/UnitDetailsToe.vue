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

interface Props {
  unit: NUnit;
  isLocked?: boolean;
}

const props = defineProps<Props>();

const {
  store: {
    state: { equipmentMap, personnelMap, unitMap },
  },
  unitActions: { walkSubUnits, updateUnitEquipment, updateUnitPersonnel },
  time,
} = injectStrict(activeScenarioKey);

const includeSubordinates = useLocalStorage("includeSubordinates", true);

const { selectedUnitIds } = useSelectedItems();
const toeActions = useToeActions();
const isMultiMode = computed(() => selectedUnitIds.value.size > 1);

const aggregatedEquipment = shallowRef<EUnitEquipment[]>([]);
const aggregatedPersonnel = shallowRef<EUnitPersonnel[]>([]);
const aggregatedPersonnelCount = computed(() =>
  aggregatedPersonnel.value.reduce((acc, p) => acc + p.count, 0),
);

const aggregatedEquipmentCount = computed(() =>
  aggregatedEquipment.value.reduce((acc, e) => acc + e.count, 0),
);
const equipmentValues = computed(() => {
  return sortBy(Object.values(equipmentMap), "name");
});
const personnelValues = computed(() => {
  return sortBy(Object.values(personnelMap), "name");
});

const [showAddEquipment, toggleAddEquipment] = useToggle(false);
const [showAddPersonnel, toggleAddPersonnel] = useToggle(false);

watch(
  [() => selectedUnitIds, includeSubordinates, time.scenarioTime],
  () => {
    const aggEquipment: Record<string, { count: number; onHand: number }> = {};
    const aggPersonnel: Record<string, number> = {};
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
        aggPersonnel[p.id] = (aggPersonnel[p.id] ?? 0) + p.count;
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
    aggregatedPersonnel.value = Object.entries(aggPersonnel).map(([id, count]) => ({
      id,
      name: personnelMap[id]?.name ?? id,
      description: personnelMap[id]?.description ?? "",
      count,
    }));
  },
  { immediate: true, deep: true },
);

function updateEquipment(equipmentId: string, count: number) {
  updateUnitEquipment(props.unit.id, equipmentId, { count });
  triggerRef(selectedUnitIds);
}

function updatePersonnel(personnelId: string, count: number) {
  updateUnitPersonnel(props.unit.id, personnelId, { count });
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
    <div></div>
    <ToggleField v-model="includeSubordinates">Include subordinates</ToggleField>
  </div>
  <div class="prose p-1 dark:prose-invert">
    <AccordionPanel :label="`Equipment (${aggregatedEquipmentCount})`" defaultOpen>
      <div class="flex justify-end">
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
        @delete="deleteEquipment"
        v-model:show-add="showAddEquipment"
      />
    </AccordionPanel>

    <AccordionPanel :label="`Personnel (${aggregatedPersonnelCount})`" defaultOpen>
      <div class="flex justify-end" v-if="aggregatedPersonnel.length || showAddPersonnel">
        <BaseButton
          small
          :disabled="isMultiMode || isLocked"
          @click="toggleAddPersonnel()"
          >{{ showAddPersonnel ? "Hide form" : "+ Add" }}
        </BaseButton>
      </div>
      <p v-if="showAddPersonnel" class="mt-2 text-right">
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
        @delete="deletePersonnel"
        v-model:show-add="showAddPersonnel"
      />
    </AccordionPanel>

    <p v-if="!aggregatedEquipment.length && !aggregatedPersonnel.length">
      <span v-if="includeSubordinates"
        >No data about equipment or personnel available</span
      ><span v-else>This unit does not have any equipment or personnel</span>.
    </p>
    <div class="mt-4 flex justify-end gap-2">
      <BaseButton
        v-if="!aggregatedEquipment.length"
        small
        secondary
        @click="toggleAddEquipment()"
        :disabled="isLocked"
        >Add equipment
      </BaseButton>
      <BaseButton
        v-if="!aggregatedPersonnel.length"
        small
        secondary
        @click="toggleAddPersonnel()"
        :disabled="isLocked"
        >Add personnel
      </BaseButton>
    </div>
  </div>
</template>
