<script setup lang="ts">
import { NUnit } from "@/types/internalModels";
import { computed, ref, shallowRef, watch } from "vue";
import { injectStrict, sortBy } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { UnitEquipment, UnitPersonnel } from "@/types/scenarioModels";
import { useToggle } from "@vueuse/core";
import { useSelectedItems } from "@/stores/selectedStore";
import { EntityId } from "@/types/base";

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
const equipmentSortKey = ref<"name" | "count">("count");
const [sortEquipmentAscending, toggleEquipmentAscending] = useToggle(true);
const [sortPersonnelAscending, togglePersonnelAscending] = useToggle(true);
const personnelSortKey = ref<"name" | "count">("name");

const sortedEquipment = computed(() =>
  sortBy(aggregatedEquipment.value, equipmentSortKey.value, sortEquipmentAscending.value),
);
const sortedPersonnel = computed(() =>
  sortBy(aggregatedPersonnel.value, personnelSortKey.value, sortPersonnelAscending.value),
);

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

function toggleEquipmentSort(column: "name" | "count") {
  if (equipmentSortKey.value === column) {
    toggleEquipmentAscending();
  } else {
    equipmentSortKey.value = column;
  }
}

function togglePersonnelSort(column: "name" | "count") {
  if (personnelSortKey.value === column) {
    togglePersonnelAscending();
  } else {
    personnelSortKey.value = column;
  }
}
</script>

<template>
  <div class="prose p-1">
    <table class="mt-2" v-if="aggregatedEquipment.length">
      <thead>
        <tr class="cursor-pointer">
          <th class="pl-2" @click="toggleEquipmentSort('name')">Equipment</th>
          <th class="pr-8 text-right" @click="toggleEquipmentSort('count')">Qty.</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="equipment in sortedEquipment" :key="equipment.name">
          <td class="pl-2" :title="equipment.description">{{ equipment.name }}</td>
          <td class="pr-6 text-right tabular-nums">{{ equipment.count }}</td>
        </tr>
      </tbody>
    </table>

    <table v-if="aggregatedPersonnel.length">
      <thead>
        <tr class="">
          <th class="cursor-pointer pl-2" @click="togglePersonnelSort('name')">
            Personnel
          </th>
          <th
            class="cursor-pointer pr-8 text-right"
            @click="togglePersonnelSort('count')"
          >
            Qty.
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="personnel in sortedPersonnel" :key="personnel.name">
          <td class="pl-2" :title="personnel.description">{{ personnel.name }}</td>
          <td class="pr-6 text-right tabular-nums">{{ personnel.count }}</td>
        </tr>
      </tbody>
    </table>
    <p v-if="!aggregatedEquipment.length && !aggregatedPersonnel.length">
      No data about equipment or personnel available.
    </p>
  </div>
</template>
