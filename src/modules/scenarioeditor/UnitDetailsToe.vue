<script setup lang="ts">
import { NUnit } from "@/types/internalModels";
import { computed, ref, shallowRef, watch } from "vue";
import { injectStrict, sortBy } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { UnitEquipment, UnitPersonnel } from "@/types/scenarioModels";
import { useToggle } from "@vueuse/core";

interface Props {
  unit: NUnit;
}
const props = defineProps<Props>();

const {
  unitActions: { walkSubUnits },
} = injectStrict(activeScenarioKey);

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
  () => props.unit?.id,
  () => {
    const aggEquipment: Record<string, number> = {};
    const aggPersonnel: Record<string, number> = {};
    walkSubUnits(
      props.unit.id,
      (unit) => {
        unit.equipment?.forEach((e) => {
          aggEquipment[e.name] = (aggEquipment[e.name] ?? 0) + e.count;
        });
        unit.personnel?.forEach((p) => {
          aggPersonnel[p.name] = (aggPersonnel[p.name] ?? 0) + p.count;
        });
      },
      { includeParent: true },
    );
    aggregatedEquipment.value = Object.entries(aggEquipment).map(([name, count]) => ({
      name,
      count,
    }));
    aggregatedPersonnel.value = Object.entries(aggPersonnel).map(([name, count]) => ({
      name,
      count,
    }));
  },
  { immediate: true },
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
          <td class="pl-2">{{ equipment.name }}</td>
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
          <td class="pl-2">{{ personnel.name }}</td>
          <td class="pr-6 text-right tabular-nums">{{ personnel.count }}</td>
        </tr>
      </tbody>
    </table>
    <p v-if="!aggregatedEquipment.length && !aggregatedPersonnel.length">
      No data about equipment or personnel available.
    </p>
  </div>
</template>
