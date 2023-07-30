<script setup lang="ts">
import { NUnit } from "@/types/internalModels";
import { computed, ref, shallowRef, watch } from "vue";
import { injectStrict, sortBy } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { UnitEquipment, UnitPersonnel } from "@/types/scenarioModels";
import { useToggle } from "@vueuse/core";
import { useSelectedItems } from "@/stores/selectedStore";
import { EntityId } from "@/types/base";
import BaseButton from "@/components/BaseButton.vue";
import TableHeader from "@/components/TableHeader.vue";
import UnitToeItemTable from "@/modules/scenarioeditor/UnitToeItemTable.vue";

interface Props {
  unit: NUnit;
}
const props = defineProps<Props>();

const {
  store: {
    state: { equipmentMap, personnelMap, unitMap },
  },
  unitActions: { walkSubUnits },
} = injectStrict(activeScenarioKey);

const { selectedUnitIds } = useSelectedItems();

const isMultiMode = computed(() => selectedUnitIds.value.size > 1);

const aggregatedEquipment = shallowRef<UnitEquipment[]>([]);
const aggregatedPersonnel = shallowRef<UnitPersonnel[]>([]);

watch(
  () => selectedUnitIds,
  () => {
    const aggEquipment: Record<string, number> = {};
    const aggPersonnel: Record<string, number> = {};
    const allUnitIds = new Set<EntityId>();
    selectedUnitIds.value.forEach((unitId) => {
      walkSubUnits(
        unitId,
        (unit) => {
          allUnitIds.add(unit.id);
        },
        { includeParent: true },
      );
    });
    allUnitIds.forEach((unitId) => {
      const unit = unitMap[unitId];
      unit.equipment?.forEach((e) => {
        aggEquipment[e.id] = (aggEquipment[e.id] ?? 0) + e.count;
      });
      unit.personnel?.forEach((p) => {
        aggPersonnel[p.id] = (aggPersonnel[p.id] ?? 0) + p.count;
      });
    });

    aggregatedEquipment.value = Object.entries(aggEquipment).map(([id, count]) => ({
      name: equipmentMap[id]?.name ?? id,
      description: equipmentMap[id]?.description ?? "",
      count,
    }));
    aggregatedPersonnel.value = Object.entries(aggPersonnel).map(([id, count]) => ({
      name: personnelMap[id]?.name ?? id,
      description: personnelMap[id]?.description ?? "",
      count,
    }));
  },
  { immediate: true, deep: true },
);
</script>

<template>
  <div class="prose p-1">
    <TableHeader v-if="aggregatedEquipment.length" title="Equipment">
      <BaseButton small secondary>Add</BaseButton>
    </TableHeader>
    <UnitToeItemTable :items="aggregatedEquipment" />

    <TableHeader v-if="aggregatedPersonnel.length" title="Personnel">
      <BaseButton small secondary>Add</BaseButton>
    </TableHeader>
    <UnitToeItemTable :items="aggregatedPersonnel" />

    <p v-if="!aggregatedEquipment.length && !aggregatedPersonnel.length">
      No data about equipment or personnel available.
    </p>
    <div class="mt-4 flex justify-end gap-2">
      <BaseButton v-if="!aggregatedEquipment.length" small secondary
        >Add equipment</BaseButton
      >
      <BaseButton v-if="!aggregatedPersonnel.length" small secondary
        >Add personnel</BaseButton
      >
    </div>
  </div>
</template>
